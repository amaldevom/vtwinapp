import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IServiceProperties, IPlaylist, IAsset } from '../models/IModels';

export interface ICustomDataService {
  getCustomPlaylists(serviceProps: IServiceProperties): Promise<IPlaylist[]>;
  getCustomAssets(serviceProps: IServiceProperties): Promise<IAsset[]>;
  createPlaylist(serviceProps: IServiceProperties, newPlaylist: IPlaylist): Promise<string>;
  modifyPlaylist(serviceProps: IServiceProperties, editPlaylist: IPlaylist): Promise<string>;
  deletePlaylist(serviceProps: IServiceProperties, playlistId: string): Promise<boolean>;
  createAsset(serviceProps: IServiceProperties, newAsset: IAsset): Promise<string>;
  modifyAsset(serviceProps: IServiceProperties, editAsset: IAsset): Promise<string>;
}

//Manages custom playlists and assets stored in local SharePoint lists (this code assumes the same site collection)
export class CustomDataService implements ICustomDataService {
  //Preconfigured spHttpOptions
  private spHttpOptions: any = {
    getNoMetadata: <ISPHttpClientOptions>{
      headers: {
        "Accept": "application/json;odata.metadata=none"
      }
    },
    getFullMetadata: <ISPHttpClientOptions>{
      headers: {
        "Accept": "application/json;odata.metadata=full"
      }
    },
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
    },
    deleteNoMetadata: <ISPHttpClientOptions>{
      headers: {
        "Accept": "application/json;odata.metadata=none",
        "Content-Type": "application/json",
        "X-HTTP-Method": "DELETE"
      }
    }
  };

  constructor() { }

  //Get's custom playlists stored in local SharePoint list (this code assumes the same site collection)
  public getCustomPlaylists(serviceProps: IServiceProperties): Promise<IPlaylist[]> {
    return new Promise((resolve, reject) => {
      if (DEBUG && Environment.type === EnvironmentType.Local) {
        // If the running environment is local, load the data from the mock
        resolve(require('../../../../mocks/customPlaylists.json'));
      } else {
        var urlList: string = `${serviceProps.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${serviceProps.playlistListName}')/Items?$select=Id,Title,JSONData`;
        var requestOptions = this.spHttpOptions.getFullMetadata;
        serviceProps.context.spHttpClient.get(urlList,
          SPHttpClient.configurations.v1,
          requestOptions
        ).then((responseList: SPHttpClientResponse): Promise<{ value: any }> => {
          return responseList.json();
        })
          .then((responseJson) => {
            var customPlaylists: IPlaylist[] = [];
            for (var i = 0; i < responseJson.value.length; i++) {
              try{
                var playlist: IPlaylist = JSON.parse(responseJson.value[i].JSONData);            
                playlist["@odata.etag"] = responseJson.value[i]["@odata.etag"];
                playlist.Id = `${responseJson.value[i].Id}`;
                customPlaylists.push(playlist);
              } catch(e) {
                console.error("Error getCustomPlaylists: " + e);
              }
            }
            resolve(customPlaylists);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  
  }

  //Get's custom playlist assets stored in local SharePoint list (this code assumes the same site collection)
  public getCustomAssets(serviceProps: IServiceProperties): Promise<IAsset[]> {
    return new Promise((resolve, reject) => {
      if (DEBUG && Environment.type === EnvironmentType.Local) {
        // If the running environment is local, load the data from the mock
        resolve(require('../../../../mocks/customAssets.json'));
      } else {
        var urlList: string = `${serviceProps.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${serviceProps.assetsListName}')/Items?$select=Id,Title,JSONData`;
        var requestOptions = this.spHttpOptions.getFullMetadata;
        serviceProps.context.spHttpClient.get(urlList,
          SPHttpClient.configurations.v1,
          requestOptions
        ).then((responseList: SPHttpClientResponse): Promise<{ value: any }> => {
          return responseList.json();
        })
          .then((responseJson) => {
            var customAssets: IAsset[] = [];
            for (var i = 0; i < responseJson.value.length; i++) {
              try{
                var asset: IAsset = JSON.parse(responseJson.value[i].JSONData);
                asset["@odata.etag"] = responseJson.value[i]["@odata.etag"];
                asset.Id = `${responseJson.value[i].Id}`;
                customAssets.push(asset);
              } catch(e) {
                console.error("Error getCustomAssets: " + e);
              }
            }
            resolve(customAssets);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }

  //Creates a custom playlist stored in local SharePoint list (this code assumes the same site collection)
  public createPlaylist(serviceProps: IServiceProperties, newPlaylist: IPlaylist): Promise<string> {
    delete newPlaylist['@odata.etag'];
    var requestPayload: any = {
      '[@odata.type]': `SP.Data.${serviceProps.playlistListName}ListItem`,
      'Title': newPlaylist.Title,
      'JSONData': JSON.stringify(newPlaylist)
    };

    var urlList: string = `${serviceProps.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${serviceProps.playlistListName}')/items`;
    var requestOptions = this.spHttpOptions.postNoMetadata;
    requestOptions.body = JSON.stringify(requestPayload);

    return new Promise((resolve, reject) => {
      let newPlaylistId: string = "0";
      serviceProps.context.spHttpClient.post(urlList,
        SPHttpClient.configurations.v1,
        requestOptions
      )
        .then((responseList: SPHttpClientResponse) => {
          if (responseList.ok) {
            return responseList.json();
          } else {
            resolve("0");
          }
        })
        .then((responseJson) => {
          resolve(`${responseJson.Id}`);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  //Updates a custom playlist stored in local SharePoint list (this code assumes the same site collection)
  public modifyPlaylist(serviceProps: IServiceProperties, editPlaylist: IPlaylist): Promise<string> {
    var etag: string = editPlaylist['@odata.etag'];
    delete editPlaylist['@odata.etag'];
    var requestPayload: any = {
      '[@odata.type]': `SP.Data.${serviceProps.playlistListName}ListItem`,
      'Id': editPlaylist.Id,
      'JSONData': JSON.stringify(editPlaylist)
    };

    var urlList: string = `${serviceProps.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${serviceProps.playlistListName}')/items(${editPlaylist.Id})`;
    var requestOptions = this.spHttpOptions.updateNoMetadata;
    requestOptions.headers['IF-MATCH'] = (etag == undefined)?"*":etag;
    requestOptions.body = JSON.stringify(requestPayload);
    return new Promise((resolve, reject) => {
      serviceProps.context.spHttpClient.post(urlList,
        SPHttpClient.configurations.v1,
        requestOptions
      )
        .then((responseList: SPHttpClientResponse) => {
          if (responseList.ok) {
            var newEtag: number = +JSON.parse(etag);
            newEtag++;
            resolve(`"${newEtag}"`);
          } else {
            resolve("0");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  //Delete's a custom playlist stored in local SharePoint list (this code assumes the same site collection)
  //Does not remove associated assets, could be updated to look for orphaned assets and act accordingly
  public deletePlaylist(serviceProps: IServiceProperties, playlistId: string): Promise<boolean> {
    var urlList: string = `${serviceProps.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${serviceProps.playlistListName}')/items(${playlistId})`;
    var requestOptions = this.spHttpOptions.deleteNoMetadata;
    requestOptions.headers['IF-MATCH'] = "*";
    return new Promise((resolve, reject) => {
      serviceProps.context.spHttpClient.post(urlList,
        SPHttpClient.configurations.v1,
        requestOptions
      )
        .then((responseList: SPHttpClientResponse) => {
          resolve(responseList.ok);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  //Creates a custom playlist asset stored in local SharePoint list (this code assumes the same site collection)
  public createAsset(serviceProps: IServiceProperties, newAsset: IAsset): Promise<string> {
    delete newAsset['@odata.etag'];
    var requestPayload: any = {
      '[@odata.type]': `SP.Data.${serviceProps.assetsListName}ListItem`,
      'Title': newAsset.Title,
      'JSONData': JSON.stringify(newAsset)
    };

    var urlList: string = `${serviceProps.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${serviceProps.assetsListName}')/items`;
    var requestOptions = this.spHttpOptions.postNoMetadata;
    requestOptions.body = JSON.stringify(requestPayload);

    return new Promise((resolve, reject) => {
      serviceProps.context.spHttpClient.post(urlList,
        SPHttpClient.configurations.v1,
        requestOptions
      )
        .then((responseList: SPHttpClientResponse) => {
          if (responseList.ok) {
            return responseList.json();
          } else {
            resolve("0");
          }
        })
        .then((responseJson) => {
          resolve(`${responseJson.Id}`);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  //Updates a custom playlist asset stored in local SharePoint list (this code assumes the same site collection)
  public modifyAsset(serviceProps: IServiceProperties, editAsset: IAsset): Promise<string> {
    var etag: string = editAsset['@odata.etag'];
    delete editAsset['@odata.etag'];
    var requestPayload: any = {
      '[@odata.type]': `SP.Data.${serviceProps.assetsListName}ListItem`,
      'Id': editAsset.Id,
      'JSONData': JSON.stringify(editAsset)
    };

    var urlList: string = `${serviceProps.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${serviceProps.assetsListName}')/items(${editAsset.Id})`;
    var requestOptions = this.spHttpOptions.updateNoMetadata;
    requestOptions.headers['IF-MATCH'] = (etag == undefined)?"*":etag;
    requestOptions.body = JSON.stringify(requestPayload);
    return new Promise((resolve, reject) => {
      serviceProps.context.spHttpClient.post(urlList,
        SPHttpClient.configurations.v1,
        requestOptions
      )
        .then((responseList: SPHttpClientResponse) => {
          if (responseList.ok) {
            var newEtag: number = +JSON.parse(etag);
            newEtag++;
            resolve(`"${newEtag}"`);
          } else {
            resolve("0");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}