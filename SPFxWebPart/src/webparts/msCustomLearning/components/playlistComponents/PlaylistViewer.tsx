import * as React from 'react';

import styles from "./playlists.module.scss";
import * as lodash from "lodash";
import {RouteComponentProps, Redirect} from 'react-router-dom';
import {IconButton} from 'office-ui-fabric-react/lib/Button';
import {IServiceProperties, IAsset, Asset, IPlaylist, Playlist, IMetadata} from '../../models/IModels';
import {IDataService, DataService } from '../../services/DataService';

import { autobind } from '@uifabric/utilities/lib';
import { Nav, INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/Nav';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import { ICustomDataService, CustomDataService } from '../../services/CustomDataService';
import NewAsset from './NewAsset';
import AssetCard from '../cardComponents/AssetCard';
import ShareDialog from '../miscComponents/ShareDialog';
import AddAsset from './AddAsset';

export interface IPlaylistViewerRouterProps {
  playlistId: string;
}

export interface IPlaylistViewerProps extends RouteComponentProps<IPlaylistViewerRouterProps> {
  navItems: IBreadcrumbItem[];
  playlists: IPlaylist[];
  assets: IAsset[];
  userGroup: string;
  serviceProps: IServiceProperties;
  metadata: IMetadata;
  setErrorMessage: Function;
  reloadAssets: Function;
}

export interface IPlaylistViewerState {
  navItems: IBreadcrumbItem[];
  selectedAsset: IAsset;
  showNewAsset: boolean;
  showAddAsset: boolean;
  currentPlaylist: IPlaylist;
  playlistAssets: IAsset[];
  showPlaylistMenu: boolean;
  goEditPlaylist: boolean;
  goDeletePlaylist: boolean;
  hideShare: boolean;
}

export class PlaylistViewerState implements IPlaylistViewerState {
  constructor(
    public navItems: IBreadcrumbItem[] = [],
    public selectedAsset: IAsset = new Asset(),
    public showNewAsset: boolean = false,
    public showAddAsset: boolean = false,
    public currentPlaylist: IPlaylist = new Playlist(),
    public playlistAssets: IAsset[] = [],
    public showPlaylistMenu: boolean = false,
    public goEditPlaylist: boolean = false,
    public goDeletePlaylist: boolean = false,
    public hideShare: boolean = true
  ) {}
}

export default class PlaylistViewer extends React.Component<IPlaylistViewerProps, IPlaylistViewerState> {
  private dataService: IDataService = new DataService();
  private dataCustomService: ICustomDataService = new CustomDataService();

  private playlistNav: INavLinkGroup[] = [];

  public constructor(props: IPlaylistViewerProps){
    super(props);
    var state = new PlaylistViewerState();
    var navItems: IBreadcrumbItem[] = lodash.cloneDeep(this.props.navItems);
    state.navItems = navItems;
    if(this.props.playlists.length > 0){
      var update = this._loadPlaylist(this.props, true);
      if(update){
        state.navItems = update.navItems;
        state.currentPlaylist = update.currentPlaylist;
        state.playlistAssets = update.playlistAssets;
        state.selectedAsset = update.selectedAsset;
      }
    }    
    this.state = state;
  }

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistViewerProps>, nextState: Readonly<IPlaylistViewerState>): boolean {
    var reloadPlaylists: boolean = false;
    //Reload if playlistId on path has changed
    reloadPlaylists = (nextProps.match.params.playlistId != this.props.match.params.playlistId);
    //Reload if filtereed list of playlists has changed
    if(!reloadPlaylists)
      reloadPlaylists = (nextProps.playlists != undefined && !lodash.isEqual(nextProps.playlists,this.props.playlists));
    //Reload if assets list has changed
    if(!reloadPlaylists)
      reloadPlaylists = (nextProps.assets != undefined && !lodash.isEqual(nextProps.assets, this.props.assets));
    if(reloadPlaylists){      
      this._loadPlaylist(nextProps);
      //return true;
    }
    // if(!lodash.isEqual(nextState, this.state))
    //   return true;
    return true;
  }

  @autobind
  private _loadPlaylist(nextProps: IPlaylistViewerProps, returnVals: boolean = false): any {
    if(nextProps.playlists.length < 1) return;
    //Load Playlist
    var playlist: IPlaylist = lodash.find(nextProps.playlists, o => (o.Id === nextProps.match.params.playlistId));   
    if(playlist){
      var navItems = lodash.cloneDeep(this.props.navItems);
      navItems.push({ text: playlist.Category, key: playlist.Category, href: `#/`});
      navItems.push({ text: playlist.SubCategory, key: playlist.SubCategory, href: `#/category/${playlist.Category}/${playlist.SubCategory}`});
      navItems.push({ text: playlist.Title, key: playlist.Id, href: '', isCurrentItem: true });
      var assets: IAsset[] = [];
      if(nextProps.assets.length > 0){
        for(var i=0; i<playlist.Assets.length; i++){
          var a = lodash.find(nextProps.assets, o => (o.Id === playlist.Assets[i].toString()));
          if(a != undefined)
            assets.push(a);
        } 
      }
      //Update Playlist Nav
      this.playlistNav = [{links: []}];
      //Push create/add asset options if playlist is custom
      if((this.props.userGroup === "Owners") && (playlist.Source === "Tenant")){
        this.playlistNav[0].links.push(
          {
            name: 'Create Asset',
            url: '',
            key: 'CreateAsset'
          },
          {
            name: 'Add Existing Asset',
            url: '',
            key: 'AddAsset'
          }
        );
      }
      //Sharable Link always available
      this.playlistNav[0].links.push(
        {
          name: 'Get Shareable Link',
          url: '',
          key: 'Share'
        }
      );
      //Push edit/delete options if playlist is custom
      if((this.props.userGroup === "Owners") && (playlist.Source === "Tenant")){
        this.playlistNav[0].links.push(
          {
            name: 'Edit Playlist',
            url: `#/playlist/edit/${playlist.Id}`,
            icon: 'Edit',
            key: 'EditPlaylist'
          },
          {
            name: 'Delete Playlist',
            url: '',
            icon: 'Delete',
            key: 'DeletePlaylist'
          }
        );
      }

      //Default selected asset to first, if exists
      var selectedAsset: IAsset = null;
      if(assets.length > 0)
        selectedAsset = assets[0];

      if(returnVals){
        return {
          navItems: navItems,
          currentPlaylist: playlist,
          playlistAssets: assets,
          selectedAsset: selectedAsset
        };
      }else{
        this.setState({
          navItems: navItems,
          currentPlaylist: playlist,
          playlistAssets: assets,
          selectedAsset: selectedAsset
        }, () => {
          this.forceUpdate();
        });
      }
    }
  }

  @autobind 
  private _refreshAssets(): void {
    this.props.reloadAssets().then(() => {
      this._loadPlaylist(this.props);
      var update = this._loadPlaylist(this.props, true);
      this.setState({
        navItems: update.navItems,
        currentPlaylist: update.currentPlaylist,
        playlistAssets: update.playlistAssets,
        selectedAsset: update.selectedAsset
      }, () => {
        this.forceUpdate();
      });
    
      this._closeNewAsset();
    });
  }

  @autobind
  private _onSelectAsset(e: React.MouseEvent<HTMLSpanElement>, index: number): void {
    this.setState({
      selectedAsset: this.state.playlistAssets[index],
      showAddAsset: false,
      showPlaylistMenu: false
    });
  }

  @autobind
  private _onShowNewAsset(): void {
    this.setState({
      showNewAsset: true,
      showAddAsset: false,
      selectedAsset: null,      
      showPlaylistMenu: false
    });
  }

  @autobind
  private _closeNewAsset(): void {
    this.setState({
      showNewAsset: false
    });
  }

  @autobind
  private _onShowAddAsset(): void {
    this.setState({
      showNewAsset: false,
      showAddAsset: true,
      selectedAsset: null,   
      showPlaylistMenu: false
    });
  }

  @autobind
  private _showPlaylistNav() {
    var currentMenu: boolean = !this.state.showPlaylistMenu;
    this.setState({showPlaylistMenu: currentMenu});
  }

  @autobind
  private _onNavClick(e: React.MouseEvent<HTMLElement>, item: INavLink): void {
    switch(item.key){
      case "CreateAsset":
        this._onShowNewAsset();
        break;
      case "AddAsset":
        this._onShowAddAsset();
        break;
      case "Share":
        this._onShare();
        break;
      case "DeletePlaylist":
        this._onDeletePlaylist();
        break;
      default:
        this.setState({showPlaylistMenu: false});
        break;
    }
  }

  @autobind
  private _onAddAsset(assetId: string) {
    var currentPlaylist = lodash.cloneDeep(this.state.currentPlaylist);
    currentPlaylist.Assets.push(assetId);
    
    var assets = lodash.cloneDeep(this.state.playlistAssets);
    var a = lodash.find(this.props.assets, o => (o.Id === assetId));
    if(a != undefined)
      assets.push(a);

    this.dataCustomService.modifyPlaylist(this.props.serviceProps, currentPlaylist)
    .then((result: string) => {
      if(result){
        currentPlaylist["@odata.etag"] = result;
        this.setState({
          currentPlaylist: currentPlaylist,
          playlistAssets: assets
        });
      }else{
        this.props.setErrorMessage("Could not add asset to current playlist.");
      }
    });
  }

  @autobind
  private _onDeletePlaylist() {
    this.dataCustomService.deletePlaylist(this.props.serviceProps, this.state.currentPlaylist.Id)
    .then((result: boolean) => {
      if(result)
        this.props.reloadAssets().then(() => {
          this.setState({
            goDeletePlaylist: true,
            showPlaylistMenu: false
          });
        });
    });
  }

  @autobind
  private _onShare(): void {
    this.setState({
      hideShare: false,
      showPlaylistMenu: false
    });
  }

  @autobind
  private _closeShare(): void {
    this.setState({
      hideShare: true
    });
  }

  @autobind
  private _deleteAsset(assetId: string): void {
    var currentPlaylist = lodash.cloneDeep(this.state.currentPlaylist);
    var idx = currentPlaylist.Assets.indexOf(assetId);
    if(idx > -1){
      currentPlaylist.Assets.splice(idx,1);

      this.dataCustomService.modifyPlaylist(this.props.serviceProps, currentPlaylist)
      .then((result: string) => {
        if(result){
          this.props.reloadAssets().then(() => {
            this._loadPlaylist(this.props);
            this._closeNewAsset();
          });
        }else{
          this.props.setErrorMessage("Could not delete asset from current playlist.");
        }
      });
    }
  }

  @autobind
  private _editAsset(assetId: string): void {
    var editAsset: IAsset = lodash.find(this.state.playlistAssets, o => (o.Id === assetId));
    this.setState({
      showNewAsset: true,
      showAddAsset: false,
      showPlaylistMenu: false,
      selectedAsset: editAsset
    });
  }

  public render(): JSX.Element {
    if(this.state.goDeletePlaylist){
      return <Redirect to={`/`} />;
    }
    if(!this.state.currentPlaylist)
      return (<div></div>);
    return (
      <div>
        <Breadcrumb
          className={styles.formHeading}
          items={this.state.navItems}
          onReduceData={undefined}
          ariaLabel={'Category breadcrumb'}
        />
        <div className={styles.playlistCont}>
          <div className={styles.playlistAssets}>
            <div className={styles.playlistInfo}>
              <div className={styles.playlistInfoTitleCont}>
                <div className={styles.playlistInfoTitle}>{this.state.currentPlaylist.Title}</div>
                <div className={styles.playlistInfoIcons}>
                  <IconButton
                    onClick={this._showPlaylistNav}
                    iconProps={{ iconName: 'ContextMenu' }}
                    title="Playlist Menu"
                    ariaLabel="PlaylistMenu"
                  />
                  <div className={styles.menu + ' ' + ((this.state.showPlaylistMenu)?styles.show:'')}>
                    <Nav
                      groups={this.playlistNav}
                      expandedStateText={'expanded'}
                      collapsedStateText={'collapsed'}
                      onLinkClick={this._onNavClick}
                    />
                  </div>
                </div>
              </div>
            </div>
            {this.state.playlistAssets && this.state.playlistAssets && this.state.playlistAssets.length > 0 &&
              this.state.playlistAssets.map((asset: IAsset, index: number) => {
                return(
                  <AssetCard 
                    cardId={asset.Id}
                    cardIndex={index}
                    cardTitle={asset.Title}
                    cardDescription={asset.Description}
                    onSelect={this._onSelectAsset}
                    deleteEnabled={(this.props.userGroup === "Owners" && this.state.currentPlaylist.Source === "Tenant")}
                    onDelete={this._deleteAsset}
                    editEnabled={(this.props.userGroup === "Owners" && asset.Source === "Tenant")}
                    onEdit={this._editAsset}
                    selected={(this.state.selectedAsset && (asset.Id === this.state.selectedAsset.Id))}
                  />
                );
              })
            }
          </div><div className={styles.playlistBody}>
            {!this.state.showNewAsset && !this.state.showAddAsset && this.state.playlistAssets && this.state.selectedAsset && this.state.selectedAsset.Url && 
              <div className={styles.iframeCont}>
              <iframe className={styles.iframeResizer} src={this.state.selectedAsset.Url} scrolling="No"></iframe>
              </div>
            }
            {!this.state.showNewAsset && !this.state.showAddAsset && this.state.playlistAssets && this.state.playlistAssets.length < 1 &&
              <p className={styles.instructions}><i className={"ms-Icon ms-Icon--Lightbulb"} aria-hidden={true}></i>Click the menu button to add assets or create a new asset.</p>
            }
            {this.state.showNewAsset && !this.state.showAddAsset &&
              <NewAsset
                metadata={this.props.metadata}
                serviceProps={this.props.serviceProps}
                setErrorMessage={this.props.setErrorMessage}
                refreshAssets={this._refreshAssets}
                currentPlaylist={this.state.currentPlaylist}
                closeAsset={this._closeNewAsset}
                currentAsset={this.state.selectedAsset}
              />
            }
            {!this.state.showNewAsset && this.state.showAddAsset && this.state.playlistAssets &&
              <AddAsset
                metadata={this.props.metadata}
                serviceProps={this.props.serviceProps}
                setErrorMessage={this.props.setErrorMessage}
                addAsset={this._onAddAsset}
                currentPlaylist={this.state.currentPlaylist}
                currentAssets={this.state.playlistAssets}
                assets={this.props.assets}
              />
            }
          </div>
        </div>
        <ShareDialog 
          shareTitle={'Share Playlist'} 
          shareUrl={`${window.location.origin}${window.location.pathname}#${this.props.location.pathname}`} 
          hideShare={this.state.hideShare} 
          closeShare={this._closeShare} 
        />
      </div>
    );
  }
}