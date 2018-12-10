import * as React from 'react';
import * as lodash from 'lodash';

import styles from './playlists.module.scss';

import { IServiceProperties, IMetadata, ISubCategory, IAsset, IPlaylist, ICategory, IAudience, IChoice} from '../../models/IModels';
import { PrimaryButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { autobind } from '@uifabric/utilities/lib';

export interface IAddAssetProps {
  metadata: IMetadata;
  serviceProps: IServiceProperties;
  setErrorMessage: Function;
  addAsset(assetId: string): void;
  currentPlaylist: IPlaylist;
  currentAssets: IAsset[];
  assets: IAsset[];
}

export interface ICurrentAssetFilter {
  category: string;
  subcategory: string;
  audience: string;
  level: string;
}

export class CurrentAssetFilter implements ICurrentAssetFilter {
  constructor(
    public category: string = "",
    public subcategory: string = "",
    public audience: string = "",
    public level: string = ""
  ) {}
}

export interface IAddAssetState{
  addAsset: IAsset;
  filteredAssets: IAsset[];
  categoryList: IChoice[];
  subcategoryList: IChoice[];
  audienceList: IChoice[];
  levelList: IChoice[];
  currentFilter: ICurrentAssetFilter;
}

export class AddAssetState implements IAddAssetState {
  constructor(
    public addAsset: IAsset = null,
    public filteredAssets: IAsset[] = [],
    public categoryList: IChoice[] = [],
    public subcategoryList: IChoice[] = [],
    public audienceList: IChoice[] = [],
    public levelList: IChoice[] = [],
    public currentFilter: ICurrentAssetFilter = new CurrentAssetFilter()
  ) {}
}

export default class AddAsset extends React.Component<IAddAssetProps, IAddAssetState> {
  private addImage: any = require('../../assets/Asset_Add.png');

  public constructor(props: IAddAssetProps){
    super(props);
    var state = new AddAssetState();
  
    var categoryList: IChoice[] = lodash.reduce(this.props.metadata.Categories, 
      (result: IChoice[], value: ICategory) => { 
        result.push({key: value.Name, text: value.Name}); 
        return result;
      }, []);
    //categoryList.splice(0,0,{key: "", text: ""});
    var audienceList: IChoice[] = lodash.reduce(this.props.metadata.Audiences, 
      (result: IChoice[], value: IAudience) => { 
        result.push({key: value.Name, text: value.Name}); 
        return result;
      }, []);
    //audienceList.splice(0,0,{key: "", text: ""});
    var levelList: IChoice[] = lodash.reduce(this.props.metadata.Levels, 
      (result: IChoice[], value: string) => { 
        result.push({key: value, text: value}); 
        return result;
      }, []);
    //levelList.push({key: "", text: ""});
    var filteredAssets = this._filterAssets(state.currentFilter, this.props);
    state.categoryList = categoryList;
    state.audienceList = audienceList;
    state.levelList = levelList;
    state.filteredAssets = filteredAssets;

    this.state = state;
  }

  public shouldComponentUpdate(nextProps: IAddAssetProps, nextState: IAddAssetState): boolean{
    if(!lodash.isEqual(nextProps.currentAssets, this.props.currentAssets)){
      var filteredAssets = this._filterAssets(this.state.currentFilter, nextProps);
      this.setState({
        filteredAssets: filteredAssets
      }, () => {
        this.forceUpdate();
      });
      return true;
    }
    if(!lodash.isEqual(nextState, this.state))
      return true;
    return false;
  }

  private _removeDuplicates(assets: IAsset[], currentAssets: IAsset[]): IAsset[] {
    var filteredAssets: IAsset[] = [];
    for(var i=0; i<assets.length; i++){
      var found = false;
      for(var j=0; j<currentAssets.length; j++){
        if(currentAssets[j].Id === assets[i].Id){
          found = true;
          break;
        }
      }
      if(!found)
        filteredAssets.push(assets[i]);
    }
    return filteredAssets;
  }

  @autobind
  private _filterAssets(currentFilter: ICurrentAssetFilter, nextProps: IAddAssetProps): IAsset[] {
    var filteredAssets: IAsset[] = this._removeDuplicates(nextProps.assets, nextProps.currentAssets);    
    if(currentFilter.category.length > 0)
      filteredAssets = lodash.remove(filteredAssets, o => (o.Category === currentFilter.category));
    if(currentFilter.subcategory.length > 0)
      filteredAssets = lodash.remove(filteredAssets, o => (o.SubCategory === currentFilter.subcategory));
    if(currentFilter.audience.length > 0)
      filteredAssets = lodash.remove(filteredAssets, o => (o.Audience === currentFilter.audience));
    if(currentFilter.level.length > 0)
      filteredAssets = lodash.remove(filteredAssets, o => (o.Level === currentFilter.level));
    return filteredAssets;
  }

  @autobind
  private _onCategoryChange(item: IDropdownOption): void {
    var currentFilter: any = lodash.clone(this.state.currentFilter);
    currentFilter.category = item.key;
    var filteredAssets: IAsset[] = this._filterAssets(currentFilter, this.props);
    
    //cascade dropdown
    var category: ICategory = lodash.find(this.props.metadata.Categories, o => (o.Name === item.key));
    var subcategoryList: IChoice[] = lodash.reduce(category.SubCategories, 
      (result: IChoice[], value: ISubCategory) => { 
        result.push({key: value.Name, text: value.Name}); 
        return result;
      }, []);

    this.setState({
      filteredAssets: filteredAssets,
      currentFilter: currentFilter,
      subcategoryList: subcategoryList
    });
  }

  @autobind
  private _onSubCategoryChange(item: IDropdownOption): void {
    var currentFilter: any = lodash.clone(this.state.currentFilter);
    currentFilter.subcategory = item.key;
    var filteredAssets: IAsset[] = this._filterAssets(currentFilter, this.props);
    
    this.setState({
      filteredAssets: filteredAssets,
      currentFilter: currentFilter
    });
  }

  @autobind
  private _onAudienceChange(item: IDropdownOption): void {
    var currentFilter: any = lodash.clone(this.state.currentFilter);
    currentFilter.audience = item.key;
    var filteredAssets: IAsset[] = this._filterAssets(currentFilter, this.props);
    
    this.setState({
      filteredAssets: filteredAssets,
      currentFilter: currentFilter
    });
  }

  @autobind
  private _onLevelChange(item: IDropdownOption): void {
    var currentFilter: any = lodash.clone(this.state.currentFilter);
    currentFilter.level = item.key;
    var filteredAssets: IAsset[] = this._filterAssets(currentFilter, this.props);
    
    this.setState({
      filteredAssets: filteredAssets,
      currentFilter: currentFilter
    });
  }

  @autobind
  private _saveAsset(e: any, assetId: string): void {
    this.props.addAsset(assetId);
  }

  @autobind
  private _onClear(property: string): void {
    var currentFilter: any = lodash.clone(this.state.currentFilter);
    switch(property){
      case "Category":
        currentFilter.category = "";
        currentFilter.subcategory = "";
        break;
      case "SubCategory":
        currentFilter.subcategory = "";
        break;
      case "Audience":
        currentFilter.audience = "";
        break;
      case "Level":
        currentFilter.level = "";
        break;
      default:
      break;
    }
    var filteredAssets: IAsset[] = this._filterAssets(currentFilter, this.props);
    
    this.setState({
      filteredAssets: filteredAssets,
      currentFilter: currentFilter
    });
  }

  public render(): React.ReactElement<IAddAssetProps> {
    return (
      <div>
        <div className={styles.addAssetInstructions}>
          <div className={styles.Icon}><img src={this.addImage} alt={"Add Image"}/></div>
          <div>
            <div className={styles.formHeading}>Start adding assets</div>
            <div>1- Select filter values to find assets</div>
            <div>2- Click 'Add' to add it to the playlist</div>
          </div>
        </div>
        <hr/>
        <div className={styles.addAssetFilterCont}>
          <div className={styles.addAssetFilter}>
            <Dropdown 
              placeHolder='Filter Category'
              label='Category'
              dropdownWidth={200}
              selectedKey={this.state.currentFilter.category}
              onChanged={this._onCategoryChange}
              options={this.state.categoryList}
            />
            <IconButton
              className={styles.addAssetFilterIcon}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {this._onClear('Category');}}
              iconProps={{ iconName: 'Cancel' }}
              title={'Clear Category Filter'}
              ariaLabel={'ClearCategory'}
            />
          </div>
          <div className={styles.addAssetFilter}>
            <Dropdown 
              placeHolder='Filter Sub-Category'
              label='Sub-Category'
              dropdownWidth={200}
              selectedKey={this.state.currentFilter.subcategory}
              onChanged={this._onSubCategoryChange}
              options={this.state.subcategoryList}
            />
            <IconButton
              className={styles.addAssetFilterIcon}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {this._onClear('SubCategory');}}
              iconProps={{ iconName: 'Cancel' }}
              title={'Clear Sub-Category Filter'}
              ariaLabel={'ClearSubCategory'}
            />
          </div>
          <div className={styles.addAssetFilter}>
            <Dropdown 
              placeHolder='Filter Audience'
              label='Audience'
              dropdownWidth={200}
              selectedKey={this.state.currentFilter.audience}
              onChanged={this._onAudienceChange}
              options={this.state.audienceList}
            />
            <IconButton
              className={styles.addAssetFilterIcon}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {this._onClear('Audience');}}
              iconProps={{ iconName: 'Cancel' }}
              title={'Clear Audience Filter'}
              ariaLabel={'ClearAudience'}
            />
          </div>
          <div className={styles.addAssetFilter}>
            <Dropdown 
              placeHolder='Filter Level'
              label='Level'
              dropdownWidth={200}
              selectedKey={this.state.currentFilter.level}
              onChanged={this._onLevelChange}
              options={this.state.levelList}
            />
            <IconButton
              className={styles.addAssetFilterIcon}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {this._onClear('Level');}}
              iconProps={{ iconName: 'Cancel' }}
              title={'Clear Level Filter'}
              ariaLabel={'ClearLevel'}
            />
          </div>
        </div>
        <hr/>
        <div className={styles.addAssetSelectCont}>
          <table>
          {this.state.filteredAssets && this.state.filteredAssets.map((asset) => {
            return(
              <tr>
                <td>
                <PrimaryButton
                  text="Add"
                  onClick={(e: React.MouseEvent<any>) => {this._saveAsset(e, asset.Id);}}
                />
                </td>
                <td>{asset.Title}</td>
              </tr>
            );
          })}
          </table>
        </div>
      </div>
    );
  }
}