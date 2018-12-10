import * as React from 'react';
import * as ReactDom from 'react-dom';

import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'MsCustomLearningWebPartStrings';
import { IMsCustomLearningProps, MsCustomLearning } from './components/MsCustomLearning';
import { IServiceProperties, ITechnology, IMetadata } from './models/IModels';
import { IDataService, DataService } from './services/DataService';
import { PropertyPaneTechnology } from '../../propertyPane/propertyFieldTechnology/propertyFieldTechnology';
import { autobind } from '@uifabric/utilities/lib';
import { IAdminDataService, AdminDataService } from './services/AdminDataService';
import { IErrProps, Err } from './components/miscComponents/Err';

export interface IMsCustomLearningWebPartProps {
  cdnBase: string;
  technologySelection: ITechnology[];
  customPlaylistListName: string;
  customAssetsListName: string;
}

export default class MsCustomLearningWebPart extends BaseClientSideWebPart<IMsCustomLearningWebPartProps> {
  private dataService: IDataService = new DataService();
  private serviceProps: IServiceProperties;
  private metadata: IMetadata;
  private userGroup: string;
  private editMode: boolean;

  constructor() {
    super();
    //Optional Query string parameter that includes routing path
    //(Needed to support issue with SharePoint page routing that strips off #... will be fixed in future release of SPO)
    
    this.editMode = document.location.href.indexOf("Mode=Edit") !== -1;
    var startLocation: string = this.getParameterByName("start", window.location.href);
    if(!this.editMode){
      if(startLocation && startLocation.length > 0)
        window.location.href = `${window.location.origin}${window.location.pathname}#${startLocation}`;
    }
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  private getParameterByName(name: string, url: string): string {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex: RegExp = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results: RegExpExecArray = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return "";
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  @autobind
  private init(): Promise<React.ReactElement<any>> {  
    this.serviceProps = {
      cdnBase: this.properties.cdnBase,
      context: this.context,
      playlistListName: this.properties.customPlaylistListName,
      assetsListName: this.properties.customAssetsListName
    };

    return new Promise<React.ReactElement<any>>((resolve) => {
      if(Environment.type == EnvironmentType.ClassicSharePoint){
        //WebPart only allowed on modern pages.
        const element: React.ReactElement<IErrProps> = React.createElement(
          Err,
          {
            errorMessage: "The Microsoft Training Services web part is only accessible thru SharePoint Online communication sites. <a href='https://support.office.com/en-us/article/what-is-a-sharepoint-communication-site-94a33429-e580-45c3-a090-5512a8070732'>Learn more</a> about communication sites and how to create them."
          }
        );
        resolve(element);
      } else {
        //Get user sharepoint group association for security of categories
        this.dataService.getUser(this.serviceProps).then((result) => {
          this.userGroup = result;
          //If custom list names are present
          if (this.properties.customPlaylistListName && this.properties.customAssetsListName &&
          this.properties.customPlaylistListName.length > 0 && this.properties.customAssetsListName.length > 0) {
            var adminDataService: IAdminDataService = new AdminDataService();
            var isAdmin: boolean = (this.userGroup === "Owners");
            //Validate lists are present.. create if necessary 
            adminDataService.validateLists(this.serviceProps, isAdmin).then((valid: boolean) => {
              //If lists are not present and user is not admin, will return false
              if (valid) {
                //Render 
                const element: React.ReactElement<IMsCustomLearningProps> = React.createElement(
                  MsCustomLearning,
                  {
                    serviceProps: this.serviceProps,
                    technologySelection: this.properties.technologySelection,
                    metadata: this.metadata,
                    userGroup: this.userGroup
                  }
                );
                
                if (this.metadata == undefined || Object.keys(this.metadata).length == 0) {
                  this.dataService.getMetadata(this.serviceProps).then((results) => {
                    this.metadata = results;
                    if (this.properties.technologySelection == undefined || this.properties.technologySelection.length < 1) {
                      //Assume first load
                      this.properties.technologySelection = this.metadata.Technologies;
                    }
                    element.props.metadata = this.metadata;
                    element.props.technologySelection = this.properties.technologySelection;
                    resolve(element);
                  });
                } else {
                  resolve(element);
                }
              } else {
                //Render error element, instead of MsCustomLearning element
                const element: React.ReactElement<IErrProps> = React.createElement(
                  Err,
                  {
                    errorMessage: 'Could not validate lists.'
                  }
                );
                resolve(element);
              }
            });
          } else {
            //Render error element, instead of MsCustomLearning element
            const element: React.ReactElement<IErrProps> = React.createElement(
              Err,
              {
                errorMessage: 'WebPart properties are incomplete -- ' + strings.CustomPlaylistListNameLabel + ' or ' + strings.CustomAssetsListNameLabel
              }
            );
            resolve(element);
          }
        });
      }
    });
  }

  public render(): void {
    this.init().then((element: React.ReactElement<any>) => {
      ReactDom.render(element, this.domElement);
    });    
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    var pathIdx = propertyPath.indexOf('.');
    if (propertyPath.substring(pathIdx + 1) === "technologySelection") {
      this.properties.technologySelection = newValue;
    } else if (propertyPath.substring(pathIdx + 1) === "customPlaylistListName") {
      this.serviceProps.playlistListName = newValue;
    } else if (propertyPath.substring(pathIdx + 1) === "customAssetsListName") {
      this.serviceProps.assetsListName = newValue;
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.TechnologyGroupName,
              groupFields: [
                PropertyPaneTechnology('technologySelection', {
                  label: strings.TechnologyLabel,
                  initialValue: this.properties.technologySelection,
                  displayValues: this.metadata.Technologies,
                  render: this.render.bind(this),
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  properties: this.properties,
                  disabled: false,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'webpartTechnology'
                })
              ]
            }
          ]
        },
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.ListConfigurationGroupName,
              groupFields: [
                PropertyPaneTextField('customPlaylistListName', {
                  label: strings.CustomPlaylistListNameLabel
                }),
                PropertyPaneTextField('customAssetsListName', {
                  label: strings.CustomAssetsListNameLabel
                }),
                PropertyPaneTextField('cdnBase', {
                  label: strings.CDNBaseNameLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
