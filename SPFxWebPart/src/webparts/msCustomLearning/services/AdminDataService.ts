import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions, SPHttpClientBatch } from '@microsoft/sp-http';
import { IServiceProperties } from '../models/IModels';

export interface IAdminDataService{
  validateLists(serviceProps: IServiceProperties, owner: boolean): Promise<boolean>;
}

export class AdminDataService implements IAdminDataService {
  private listSchema = {
    "[@odata.type]": "SP.List",
    "AllowContentTypes": true,
    "BaseTemplate": 100,
    "ContentTypesEnabled": true,
    "Hidden": false,
    "Description": "",
    "Title": ""
  };

  private fieldSchemaJSON = {
    "[@odata.type]": "SP.Field",
    "FieldTypeKind": 3,
    "Title": "JSONData"
  };

  private spHttpOptions: any = {
    postNoMetadata: <ISPHttpClientOptions>{
      headers: {
        "Accept": "application/json;odata.metadata=none",
        "Content-Type": "application/json"
      }
    },
    updateNoMetadata: <ISPHttpClientOptions>{
      headers: {
        "Accept": "application/json;odata.metadata=none",
        "Content-Type": "application/json",
        "X-HTTP-Method": "MERGE"
      }
    }
  };

  constructor() { }

  //Generic functio to create a custom field in a specific list
  //private createCustomField(httpBatch: SPHttpClientBatch, url: string, field: string): Promise<boolean> {
  private createCustomField(spHttp: SPHttpClient, url: string, field: string | any): Promise<boolean> {
    return new Promise((resolveField) => {
      var fieldOptions = this.spHttpOptions.postNoMetadata;
      fieldOptions.body = JSON.stringify(field);
      spHttp.post(url,
        SPHttpClient.configurations.v1,
        fieldOptions
      ).then((responseField: SPHttpClientResponse) => {
        if (responseField.ok)
          resolveField(true);
        else
          resolveField(false);
      });
    });
  }

  //Generic function to create a custom list
  private createCustomList(serviceProps: IServiceProperties, listName: string, listDescription: string, fields: any[]): Promise<boolean> {
    this.listSchema.Title = listName;
    this.listSchema.Description = listDescription;
    var urlList: string = serviceProps.context.pageContext.web.absoluteUrl + "/_api/web/lists";
    var requestOptions = this.spHttpOptions.postNoMetadata;
    requestOptions.body = JSON.stringify(this.listSchema);
    return new Promise((resolve, reject) => {
      serviceProps.context.spHttpClient.post(urlList,
        SPHttpClient.configurations.v1,
        requestOptions
      )
        .then((responseList: SPHttpClientResponse) => {
          if (responseList.ok) {
            responseList.json().then((list) => {
              var listGuid = list.Id;
              var urlFieldJSON: string = serviceProps.context.pageContext.web.absoluteUrl + "/_api/web/lists(guid'" + listGuid + "')/Fields";
              this.createCustomField(serviceProps.context.spHttpClient, urlFieldJSON, fields[0]).then((result: boolean) => {
                resolve(result);
              });              
            });
          } else
            resolve(false);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  //Validate that custom playlist and assets SharePoint lists exist based on web part properties
  public validateLists(serviceProps: IServiceProperties, owner: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      var listsCheck: Promise<boolean>[] = [];

      listsCheck.push(new Promise((resolve1) => {
        serviceProps.context.spHttpClient.get(
          `${serviceProps.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${serviceProps.playlistListName}')/Fields`,
          SPHttpClient.configurations.v1
        )
          .then((response: SPHttpClientResponse) => {
            if (response.ok) {
              response.json().then((fields) => {
                var found = false;
                for(var i=0; i<fields.value.length; i++){
                  if(fields.value[i].Title === this.fieldSchemaJSON.Title)
                    found = true;
                }
                if(!found){
                  var listGuid = fields.value[0]["@odata.editLink"].split("Lists(guid'")[1].split("')")[0];
                  var urlFieldJSON: string = serviceProps.context.pageContext.web.absoluteUrl + "/_api/web/lists(guid'" + listGuid + "')/Fields";
                  this.createCustomField(serviceProps.context.spHttpClient, urlFieldJSON, this.fieldSchemaJSON).then((result: boolean) => {
                    resolve1(result);
                  }); 
                }else{
                  resolve1(true);
                }
              }, () => { 
                console.error(`Could not validate fields in list: ${serviceProps.playlistListName}`);
                resolve1(false);
              });
              //Fields returned -- Any upgrade code would go here
              //resolve1(true);
            } else {
              //If user is in Owners group, tries to create list
              if(owner){
                this.createCustomList(serviceProps, serviceProps.playlistListName, `${serviceProps.playlistListName} Custom Detail`, [this.fieldSchemaJSON]).then((resultCreate: boolean) => {
                  resolve1(resultCreate);
                });
              }else{
                resolve1(false);
              }
            }
          });
      }));

      listsCheck.push(new Promise((resolve2) => {
        serviceProps.context.spHttpClient.get(`${serviceProps.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${serviceProps.assetsListName}')/Fields`, SPHttpClient.configurations.v1)
          .then((response: SPHttpClientResponse) => {
            if (response.ok) {
              response.json().then((fields) => {
                var found = false;
                for(var i=0; i<fields.value.length; i++){
                  if(fields.value[i].Title === this.fieldSchemaJSON.Title)
                    found = true;
                }
                if(!found){
                  var listGuid = fields.value[0]["@odata.editLink"].split("Lists(guid'")[1].split("')")[0];
                  var urlFieldJSON: string = serviceProps.context.pageContext.web.absoluteUrl + "/_api/web/lists(guid'" + listGuid + "')/Fields";
                  this.createCustomField(serviceProps.context.spHttpClient, urlFieldJSON, this.fieldSchemaJSON).then((result: boolean) => {
                    resolve2(result);
                  }); 
                }else{
                  resolve2(true);
                }
              }, () => { 
                console.error(`Could not validate fields in list: ${serviceProps.playlistListName}`);
                resolve2(false);
              });
              //Fields returned -- Any upgrade code would go here
              //resolve2(true);
            } else {
              //If user is in Owners group, tries to create list
              if(owner){
                this.createCustomList(serviceProps, serviceProps.assetsListName, `${serviceProps.assetsListName} Custom Detail`, [this.fieldSchemaJSON]).then((resultCreate: boolean) => {
                  resolve2(resultCreate);
                });
              }else{
                resolve2(false);
              }
            }
          });
      }));

      Promise.all(listsCheck).then((results) => {
        for (var i = 0; i < results.length; i++) {
          if (!results[i]) {
            resolve(false);
          }
        }
        resolve(true);
      });
    });
  }
}