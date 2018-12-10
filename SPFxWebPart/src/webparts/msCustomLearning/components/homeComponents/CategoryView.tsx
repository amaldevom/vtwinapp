import * as React from 'react';
import * as lodash from 'lodash';
import { RouteComponentProps } from 'react-router-dom';
import styles from "../MsCustomLearning.module.scss";

import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import { autobind } from '@uifabric/utilities/lib';
import { IPlaylist, IMetadata } from '../../models/IModels';
import ShareDialog from '../miscComponents/ShareDialog';
import LargeCard from '../cardComponents/LargeCard';

export interface ICategoryViewRouterProps {
  category: string;
  subcategory: string;
}

export interface ICategoryViewProps extends RouteComponentProps<ICategoryViewRouterProps> {
  playlists: IPlaylist[];
  navItems: IBreadcrumbItem[];
  setErrorMessage: Function;
}

export interface ICategoryViewState {
  navItems: IBreadcrumbItem[];
  displayPlaylists: IPlaylist[];
  shareTitle: string;
  shareUrl: string;
  hideShare: boolean;
}

export class CategoryViewState implements ICategoryViewState {
  constructor(
    public navItems: IBreadcrumbItem[] = [],
    public displayPlaylists: IPlaylist[] = [],
    public shareTitle: string = "",
    public shareUrl: string = "",
    public hideShare: boolean = true
  ) {}
}

export default class CategoryView extends React.Component<ICategoryViewProps, ICategoryViewState> {
  public constructor(props: ICategoryViewProps){
    super(props);
    var state = new CategoryViewState();

    var navItems: IBreadcrumbItem[] = lodash.cloneDeep(this.props.navItems);
    navItems.push({ text: this.props.match.params.category, key: `${this.props.match.params.category}`, href: '#/'});
    navItems.push({ text: this.props.match.params.subcategory, key: `${this.props.match.params.subcategory}`, href: this.props.location.pathname, isCurrentItem: true });
    state.navItems = navItems;

    if(this.props.playlists.length > 0){
      var update = this._filterPlaylists(this.props, true);
      if(update){
        state.displayPlaylists = update;
      }
    }    
    
    this.state = state;
  }

  public shouldComponentUpdate(nextProps: Readonly<ICategoryViewProps>, nextState: Readonly<ICategoryViewState>): boolean {
    //Check Property changes
    if(nextProps.match.params.category != this.props.match.params.category ||
      nextProps.match.params.subcategory != this.props.match.params.subcategory ||
      !lodash.isEqual(nextProps.playlists, this.props.playlists)){
        this._filterPlaylists(nextProps);
        return true;
      }
    if(!lodash.isEqual(nextState, this.state))
      return true;
    return false;
  }

  @autobind
  private _filterPlaylists(nextProps: ICategoryViewProps, returnVals: boolean = false): IPlaylist[]{
    if(nextProps.playlists.length < 1) { return; }
    var newFiltered: IPlaylist[] = lodash.filter(nextProps.playlists, o => (o.Category === nextProps.match.params.category && o.SubCategory == nextProps.match.params.subcategory));

    if(returnVals){
      return newFiltered;
    }else{
      this.setState({
        displayPlaylists: newFiltered
      }, () => {
        this.forceUpdate();
      });
    }
    
  }

  @autobind
  private _onShare(e: React.MouseEvent<HTMLSpanElement>, title: string, url: string): void {
    var shareUrl: string = `${window.location.origin}${window.location.pathname}#${url}`;
    this.setState({
      shareTitle: title,
      shareUrl: shareUrl,
      hideShare: false
    });
  }

  @autobind
  private _closeShare(): void {
    this.setState({
      shareTitle: "",
      shareUrl: "",
      hideShare: true
    });
  }

  public render(): React.ReactElement<ICategoryViewProps> {
    return (
      <div className={styles.homeCont}>
        <Breadcrumb
          className={styles.bodyHeading}
          items={this.state.navItems}
          onReduceData={undefined}
          ariaLabel={'Category breadcrumb'}
        />
        {/* <div className={styles.bodyHeading}>{this.props.match.params.sub}</div> */}
        <div className={styles.homeCardCont}>
          {this.state.displayPlaylists && this.state.displayPlaylists.map((playlist) => {
            return(
              <LargeCard 
                cardId={playlist.Id}
                cardTitle={playlist.Title}
                cardImage={playlist.Image}
                shareTitle="Copy Link"
                shareUrl={`/playlist/${playlist.Id}`}
                onShare={this._onShare}
                {...this.props}
              />
            );
          })}
        </div>
        <ShareDialog 
          shareTitle={this.state.shareTitle} 
          shareUrl={this.state.shareUrl} 
          hideShare={this.state.hideShare} 
          closeShare={this._closeShare} 
        />
      </div>
    );
  }
}