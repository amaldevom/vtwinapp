import * as React from 'react';
import { Switch, Route, withRouter, RouteComponentProps } from 'react-router-dom';
import  * as lodash from 'lodash';
import styles from "./MsCustomLearning.module.scss";

import {Navigation} from './Navigation';
import { autobind } from '@uifabric/utilities/lib';
import PlaylistViewer from './playlistComponents/PlaylistViewer';
import Search from './Search';
import { IPlaylist, IFilterPlaylists, FilterPlaylists, IServiceProperties, ITechnology, IMetadata, IAsset, ICategory } from '../models/IModels';
import {Err} from './miscComponents/Err';
import NewPlaylist from './playlistComponents/NewPlaylist';
import {ICustomDataService, CustomDataService} from '../services/CustomDataService';
import {IDataService, DataService} from '../services/DataService';
import Home from './Home';
import CategoryView from './homeComponents/CategoryView';

export interface ICustomLearningAppProps extends RouteComponentProps<any> {
  serviceProps: IServiceProperties;
  technologySelection: ITechnology[];
  metadata: IMetadata;
  userGroup: string;
}

export interface ICustomLearningAppState {
  categories: ICategory[];
  playlists: IPlaylist[];
  assets: IAsset[];
  selectedPlaylistId: string;
  currentFilter: IFilterPlaylists;
  filteredPlaylists: IPlaylist[];
  filteredAssets: IAsset[];
  errorMessage: string;
}

export class CustomLearningAppState implements ICustomLearningAppState{
  constructor (
    public categories: ICategory[] = [],
    public playlists: IPlaylist[] = [],
    public assets: IAsset[] = [],
    public selectedPlaylistId: string = "",
    public currentFilter: IFilterPlaylists = new FilterPlaylists(),
    public filteredPlaylists: IPlaylist[] = [],
    public filteredAssets: IAsset[] = [],
    public errorMessage: string = ""
  ) {}
}

class CustomLearningApp extends React.Component<ICustomLearningAppProps, ICustomLearningAppState> {
  private dataService: IDataService = new DataService();
  private dataCustomService: ICustomDataService = new CustomDataService();

  public constructor(props: ICustomLearningAppProps){
    super(props);
    var state = new CustomLearningAppState();
    state.currentFilter.Technology = this.props.technologySelection;
    this.state = state;
    this._loadAssets();
  }

  public shouldComponentUpdate(nextProps: ICustomLearningAppProps, nextState: ICustomLearningAppState){
    if(!lodash.isEqual(nextProps.location, this.props.location))
      return true;
    if(!lodash.isEqual(nextProps.technologySelection, this.props.technologySelection)){
      var newFilter = lodash.cloneDeep(this.state.currentFilter);
      newFilter.Technology = nextProps.technologySelection;
      var retVal: {playlists: IPlaylist[], categories: ICategory[] } = this._filterPlaylists(newFilter, this.state.playlists);
      this.setState({
        categories: retVal.categories,
        filteredPlaylists: retVal.playlists,
        currentFilter: newFilter
      }, () => {
        this.forceUpdate();
      });
      return true;
    }
    if(!lodash.isEqual(nextState, this.state))
      return true;
    return false;
  }

  //Used to load playlists and assets (including custom)
  @autobind
  private _loadAssets(): Promise<void>{
    return new Promise<void>((resolve, reject) => {
      var p: Promise<void>[] = [];
      p.push(this._loadPlaylistsData());
      p.push(this._loadAssetData());
      Promise.all(p)
      .then((results) => { resolve(); })
      .catch((err) => {
        console.log(`Error: CustomLearningApp.tsx-_loadAssets: ${err}`);
        reject(err);
      }); 
    });
  }
  
  //Used to refresh custom data both playlists and assets
  @autobind
  private _refreshCustom(): Promise<void>{
    return new Promise<void>((resolve, reject) => {
      var p: Promise<void>[] = [];
      p.push(this._refreshPlaylistsCustomData());
      p.push(this._refreshAssetCustomData());
      Promise.all(p)
      .then((results) => { resolve(); })
      .catch((err) => {
        console.log(`Error: CustomLearningApp.tsx-_refreshCustom: ${err}`);
        reject(err);
      }); 
    });
  }

  //Used to load playlists (including custom)
  @autobind
  private _loadPlaylistsData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      var loadPlaylists: IPlaylist[];
      this.dataService.getPlaylists(this.props.serviceProps).then((results) => {
        loadPlaylists = results;
        return this.dataCustomService.getCustomPlaylists(this.props.serviceProps);
      })
      .then((results: IPlaylist[]) => {
        for(var i=0; i<results.length; i++){
          loadPlaylists.push(results[i]);
        }
        var currentFilter: IFilterPlaylists = lodash.cloneDeep(this.state.currentFilter);
        if(currentFilter.Technology != this.props.technologySelection){
          currentFilter.Technology = this.props.technologySelection;
        }
        var retVal: {playlists: IPlaylist[], categories: ICategory[] } = this._filterPlaylists(currentFilter, loadPlaylists);
        this.setState({
          playlists: loadPlaylists,
          filteredPlaylists: retVal.playlists,
          categories: retVal.categories
        }, () => {
          resolve();
        });
      })
      .catch((err) => {
        console.log(`Error: CustomLearningApp.tsx-_loadPlaylistData: ${err}`);
        reject(err);
      }); 
    });     
  }

  //Used to reload custom playlists
  @autobind
  private _refreshPlaylistsCustomData(): Promise<void>{
    return new Promise<void>((resolve, reject) => {
      var currentPlaylists: IPlaylist[] = lodash.filter(this.state.playlists, o => (o.Source !== "Tenant"));
      this.dataCustomService.getCustomPlaylists(this.props.serviceProps)
      .then((results: IPlaylist[]) => {
        for(var i=0; i<results.length; i++){
          currentPlaylists.push(results[i]);
        }
        var retVal: {playlists: IPlaylist[], categories: ICategory[] } =  this._filterPlaylists(this.state.currentFilter, currentPlaylists);
        this.setState({
          playlists: currentPlaylists,
          filteredPlaylists: retVal.playlists,
          categories: retVal.categories
        }, () => {
          resolve();
        });
      })
      .catch((err) => {
        console.log(`Error: CustomLearningApp.tsx-_refreshPlaylistsCustomData: ${err}`);
        reject(err);
      });
    });
  }

  //Used to load assets (including custom)
  @autobind
  private _loadAssetData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      var loadAssets: IAsset[];
      this.dataService.getAssets(this.props.serviceProps).then((results) => {
        loadAssets = results;
        return this.dataCustomService.getCustomAssets(this.props.serviceProps);
      })
      .then((results: IAsset[]) => {
        for(var i=0; i<results.length; i++){
          loadAssets.push(results[i]);
        }
        this.setState({
          assets: loadAssets,
          filteredAssets: loadAssets
        }, () => {
          resolve();
        });
      })
      .catch((err) => {
        console.log(`Error: CustomLearningApp.tsx-_loadAssetData: ${err}`);
        reject(err);
      });
    });  
  }

  //Used to reload custom assets
  @autobind
  private _refreshAssetCustomData(): Promise<void>{
    return new Promise<void>((resolve, reject) => {
      var currentAssets: IAsset[] = lodash.filter(this.state.assets, o => (o.Source !== "Tenant"));
      this.dataCustomService.getCustomAssets(this.props.serviceProps)
      .then((results: IAsset[]) => {
        for(var i=0; i<results.length; i++){
          currentAssets.push(results[i]);
        }
        //var filteredAssets: IPlaylist[] = this._filterPlaylists(this.state.currentFilter, currentPlaylists);
        this.setState({
          assets: currentAssets,
          filteredAssets: currentAssets
        }, () => {
          resolve();
        });
      })
      .catch((err) => {
        console.log(`Error: CustomLearningApp.tsx-_refreshAssetCustomData: ${err}`);
        reject(err);
      });
    });
  }

  @autobind
  private _goPlaylist(playlistId: string): void { 
    if(this.props.location.pathname !== `/playlist/${playlistId}`){
      this._refreshPlaylistsCustomData().then(() => {
        this.props.history.push(`/playlist/${playlistId}`);
      });
    }
  }

  private _playlistViewerComp = (props) => {
    return (
      <PlaylistViewer 
        navItems={[{ text: 'Browse', key: 'Browse', href: '#/' }]}
        playlists={this.state.playlists}
        assets={this.state.assets}
        metadata={this.props.metadata}
        userGroup={this.props.userGroup}
        serviceProps={this.props.serviceProps}
        setErrorMessage={this._setErrorMessage}
        reloadAssets={this._refreshCustom}
        {...props}
      />
    );
  }

  private _searchComp = (props) => {
    return (
      <Search
        navItems={[{ text: 'Browse', key: 'Browse', href: '#/' }]}
        playlists={this.state.filteredPlaylists}
        setErrorMessage={this._setErrorMessage}
        {...props}
      />
    );
  }

  private _newPlaylistComp = (props) => {
    return (
      <NewPlaylist 
        serviceProps={this.props.serviceProps}
        metadata={this.props.metadata}
        playlists={this.state.playlists}
        setErrorMessage={this._setErrorMessage}
        goPlaylist={this._goPlaylist}
        {...props}
      />
    );
  }

  private _homeComp = (props) => {
    return (
      <Home 
        userGroup={this.props.userGroup}
        technologySelection={this.props.technologySelection} 
        categories={this.state.categories}
        setErrorMessage={this._setErrorMessage}
        {...props}
      />
    );
  }

  private _categoryComp = (props) => {
    return (
      <CategoryView
        playlists={this.state.filteredPlaylists}
        navItems={[{ text: 'Browse', key: 'Browse', href: '#/' }]}
        setErrorMessage={this._setErrorMessage}
        {...props}
      />
    );
  }

  @autobind
  private _setErrorMessage(message: string): void {
    this.setState({
      errorMessage: message
    });
  }

  private _updateCategoriesCount(filteredPlaylist: IPlaylist[]): ICategory[] {
    if(this.props.metadata.Categories.length < 1) return;
    var updateCategories: ICategory[] = lodash.cloneDeep(this.props.metadata.Categories);
    for(var c=0; c<updateCategories.length; c++){
      updateCategories[c].Count = 0;
      for(var s=0; s<updateCategories[c].SubCategories.length; s++){
        var countPlaylist: number = lodash.filter(filteredPlaylist, o => (o.Category === updateCategories[c].Name && o.SubCategory === updateCategories[c].SubCategories[s].Name)).length;
        updateCategories[c].SubCategories[s].Count = countPlaylist;
        if(countPlaylist > 0)
          updateCategories[c].Count += countPlaylist;
      }
    }
    return updateCategories;
  }

  public _filterPlaylists(filter: IFilterPlaylists, currentPlaylists: IPlaylist[]): { playlists: IPlaylist[], categories: ICategory[] } {
    var retVal: {playlists: IPlaylist[], categories: ICategory[] } = { playlists: [], categories: []};
    var newFiltered: IPlaylist[] = lodash.cloneDeep(currentPlaylists);
    //apply filter
    for(var i=0; i<Object.keys(filter).length; i++){
      var filterKey = Object.keys(filter)[i];
      switch(filterKey){
        case 'Technology':
          var techFilter: IPlaylist[] = [];
          //Only filter technology if modified from full list.
          if(!lodash.isEqual(filter.Technology, this.props.metadata.Technologies)){
            for(var t=0; t<filter.Technology.length; t++){
              var subjects: string[] = lodash.clone(filter.Technology[t].Subjects);
              subjects.push("");
              var tf = lodash.filter(newFiltered, o => ((o.Source !== 'Tenant') && (o.Technology === filter.Technology[t].Name && subjects.indexOf(o.Subject)>-1)));
              techFilter = lodash.concat(techFilter, tf);
            }
            var custom = lodash.filter(newFiltered, o => (o.Source === 'Tenant'));
            techFilter = lodash.concat(techFilter, custom);
            //Calculate categories & Sub Categoires count
            retVal.categories = this._updateCategoriesCount(techFilter);
            newFiltered = lodash.cloneDeep(techFilter);
          }else{
            retVal.categories = this._updateCategoriesCount(newFiltered);
          }
          break;
        case 'Search':
          if(filter.Search.length > 0){
            var searchFilter: IPlaylist[] = [];
            var sfTitle = lodash.filter(newFiltered, o => (o.Title.toLowerCase().indexOf(filter.Search.toLowerCase()) > -1));
            searchFilter = lodash.concat(searchFilter, sfTitle);
            var sfTechnology = lodash.filter(newFiltered, o => (o.Technology.toLowerCase().indexOf(filter.Search.toLowerCase()) > -1));
            searchFilter = lodash.concat(searchFilter, sfTechnology);
            var sfSubject = lodash.filter(newFiltered, o => (o.Subject.toLowerCase().indexOf(filter.Search.toLowerCase()) > -1));
            searchFilter = lodash.concat(searchFilter, sfSubject);
            var sfLevel = lodash.filter(newFiltered, o => (o.Level.toLowerCase().indexOf(filter.Search.toLowerCase()) > -1));
            searchFilter = lodash.concat(searchFilter, sfLevel);
            var sfAudience = lodash.filter(newFiltered, o => (o.Audience.toLowerCase().indexOf(filter.Search.toLowerCase()) > -1));
            searchFilter = lodash.concat(searchFilter, sfAudience);
            newFiltered = lodash.cloneDeep(searchFilter);
          }
          break;
        // -- AWAITING IMPLEMENTATION -- 
        // case 'Filters':
        //   if(filter.Filters.length > 0){
        //     var filterFiltered: IPlaylist[] = [];
        //     for(var j=0; j<filter.Filters.length; j++){
        //       var filterField = filter.Filters[j].split('-');
        //       var ff = lodash.filter(newFiltered, o => (o[filterField[0]] === filterField[1]));
        //       filterFiltered = lodash.concat(filterFiltered, ff);
        //     }
        //     newFiltered = filterFiltered;
        //   }
        //   break;
        default:
        break;
      }
    }
    retVal.playlists = newFiltered;
    return retVal;
  }

  @autobind
  private _setFilteredPlaylist(filter: IFilterPlaylists, location: string = null): void {
    var retVal: {playlists: IPlaylist[], categories: ICategory[] } = this._filterPlaylists(filter, this.state.playlists);
    //update state
    this.setState({
      categories: retVal.categories,
      filteredPlaylists: retVal.playlists,
      currentFilter: filter
    }, () => {
      if(location != undefined && this.props.location.pathname !== location)
        this.props.history.push(location);
    });
  }

  public render(): React.ReactElement<ICustomLearningAppProps> {
    return (
      // fullPage class used to add margins when webpart is in full bleed zone
      <div className={styles.msCustomLearning + " fullPage"}>
        <Err errorMessage={this.state.errorMessage} />
        <Navigation 
          serviceProps={this.props.serviceProps}
          userGroup={this.props.userGroup}
          technologySelection={this.props.technologySelection} 
          metadata={this.props.metadata}
          setFilteredPlaylist={this._setFilteredPlaylist}
          setErrorMessage={this._setErrorMessage}
        />
        <div className={styles.body}>
          <Switch>
            <Route path='/' exact render={this._homeComp}/>
            <Route path='/search' exact render={this._searchComp}/>
            <Route path='/playlist/add' exact render={this._newPlaylistComp}/>
            <Route path='/playlist/edit/:playlistId' exact render={this._newPlaylistComp}/>
            <Route path='/playlist/:playlistId' render={this._playlistViewerComp}/>
            <Route path='/category/:category/:subcategory' render={this._categoryComp}/>
          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(CustomLearningApp) as React.ComponentClass<ICustomLearningAppProps>;