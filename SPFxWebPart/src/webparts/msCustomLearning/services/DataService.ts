import * as lodash from 'lodash';
import { SPHttpClient, SPHttpClientResponse, IHttpClientOptions, HttpClientResponse, HttpClient } from '@microsoft/sp-http';
import { IMetadata, IPlaylist, IAsset, IServiceProperties } from '../models/IModels';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';

export interface IDataService {
  getMetadata(serviceProps: IServiceProperties): Promise<IMetadata>;
  getPlaylists(serviceProps: IServiceProperties): Promise<IPlaylist[]>;
  getUser(serviceProps: IServiceProperties): Promise<string>;
  getAssets(serviceProps: IServiceProperties): Promise<IAsset[]>;
}

export class DataService implements IDataService {
  private httpOptions: any = {
    getNoMetadata: <IHttpClientOptions>{
      headers: {
        "Accept": "application/json;odata.metadata=none"
      }
    }
  };

  //Loads Metadata.json file from Microsoft CDN
  public getMetadata(serviceProps: IServiceProperties): Promise<IMetadata> {
    return new Promise((resolve) => {
      if (DEBUG && Environment.type === EnvironmentType.Local) {
        // If the running environment is local, load the data from the mock
        resolve(require('../../../../../docs/metadata.json'));
      } else {
        serviceProps.context.httpClient.fetch(`${serviceProps.cdnBase}metadata.json`, HttpClient.configurations.v1, this.httpOptions.getNoMetadata)
          .then((results: HttpClientResponse) => {
            if (results.ok) {
              return results.json();
            } else {
              resolve(null);
            }
          })
          .then((resultsJson: IMetadata) => {
            for (var t = 0; t < resultsJson.Technologies.length; t++) {
              if (resultsJson.Technologies[t].Image.length > 1)
                resultsJson.Technologies[t].Image = `${serviceProps.cdnBase}${resultsJson.Technologies[t].Image}`;
            }
            for (var c = 0; c < resultsJson.Categories.length; c++) {
              for (var sc = 0; sc < resultsJson.Categories[c].SubCategories.length; sc++) {
                if (resultsJson.Categories[c].SubCategories[sc].Image.length > 1)
                  resultsJson.Categories[c].SubCategories[sc].Image = `${serviceProps.cdnBase}${resultsJson.Categories[c].SubCategories[sc].Image}`;
              }
            }
            for (var a = 0; a < resultsJson.Audiences.length; a++) {
              if (resultsJson.Audiences[a].Image.length > 1)
                resultsJson.Audiences[a].Image = `${serviceProps.cdnBase}${resultsJson.Audiences[a].Image}`;
            }
            resolve(resultsJson);
          });
      }
    });
  }

  //Loads playlists.json file from Microsoft CDN
  public getPlaylists(serviceProps: IServiceProperties): Promise<IPlaylist[]> {
    return new Promise((resolve) => {
      if (DEBUG && Environment.type === EnvironmentType.Local) {
        // If the running environment is local, load the data from the mock
        resolve(require('../../../../../docs/playlists.json'));
      } else {
        serviceProps.context.httpClient.fetch(`${serviceProps.cdnBase}playlists.json`, HttpClient.configurations.v1, this.httpOptions.getNoMetadata)
          .then((results: HttpClientResponse) => {
            if (results.ok) {
              return results.json();
            } else {
              resolve(null);
            }
          })
          .then((resultsJson: IPlaylist[]) => {
            for (var i = 0; i < resultsJson.length; i++) {
              if (resultsJson[i].Image.length > 1)
                resultsJson[i].Image = `${serviceProps.cdnBase}${resultsJson[i].Image}`;
            }
            resolve(resultsJson);
          });
      }
    });
  }

  //Calls SharePoint REST Api to determine if user is in Owners, Members, or Visitors group
  //Used to filter categories in metadata.json by the Security property
  public getUser(serviceProps: IServiceProperties): Promise<string> {
    return new Promise((resolve) => {
      if (DEBUG && Environment.type === EnvironmentType.Local) {
        // If the running environment is local, load the data from the mock
        resolve("Owners");
      } else {
        serviceProps.context.spHttpClient.get(serviceProps.context.pageContext.web.absoluteUrl + `/_api/web/currentuser/?$expand=groups`, SPHttpClient.configurations.v1)
          .then((response: SPHttpClientResponse) => {
            response.json().then((data) => {
              var ownerIndex: number = lodash.findIndex(data.Groups, o => (o["Title"].indexOf('Owners') > -1));
              var membersIndex: number = lodash.findIndex(data.Groups, o => (o["Title"].indexOf('Members') > -1));
              if (ownerIndex > -1)
                resolve("Owners");
              else if (membersIndex > -1)
                resolve("Members");
              else
                resolve("Visitors");
            });
          });
      }
    });
  }

  //Loads assets.json file from Microsoft CDN
  public getAssets(serviceProps: IServiceProperties): Promise<IAsset[]> {
    return new Promise((resolve) => {
      if (DEBUG && Environment.type === EnvironmentType.Local) {
        // If the running environment is local, load the data from the mock
        resolve(require('../../../../../docs/assets.json'));
      } else {
        serviceProps.context.httpClient.fetch(`${serviceProps.cdnBase}assets.json`, HttpClient.configurations.v1, this.httpOptions.getNoMetadata)
          .then((results: HttpClientResponse) => {
            if (results.ok) {
              return results.json();
            } else {
              resolve(null);
            }
          })
          .then((resultsJson: IAsset[]) => {
            resolve(resultsJson);
          });
      }
    });
  }
}