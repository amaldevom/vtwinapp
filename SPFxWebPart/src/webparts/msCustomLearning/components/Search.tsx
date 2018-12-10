import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import * as lodash from "lodash";
import styles from "./MsCustomLearning.module.scss";

import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import { autobind } from '@uifabric/utilities/lib';
import { IPlaylist } from '../models/IModels';
import ShareDialog from './miscComponents/ShareDialog';
import SearchCard from './cardComponents/SearchCard';

export interface ISearchProps extends RouteComponentProps<{}> {
  navItems: IBreadcrumbItem[];
  playlists: IPlaylist[];
  setErrorMessage: Function;
}

export interface ISearchState {
  navItems: IBreadcrumbItem[];
  shareUrl: string;
  hideShare: boolean;
}

export class SearchState implements ISearchState {
  constructor(
    public navItems: IBreadcrumbItem[] = [],
    public shareUrl: string = "",
    public hideShare: boolean = true
  ) {}
}

export default class Search extends React.Component<ISearchProps, ISearchState> {
  public constructor(props: ISearchProps){
    super(props);
    var state = new SearchState();
    var navItems: IBreadcrumbItem[] = lodash.cloneDeep(this.props.navItems);
    navItems.push({ text: "Search Results", key: "Search Results", href: this.props.location.pathname, isCurrentItem: true });
    state.navItems = navItems;
    this.state = state;
  }

  public shouldComponentUpdate(nextProps: Readonly<ISearchProps>, nextState: Readonly<ISearchState>): boolean {
    if(!lodash.isEqual(nextProps.playlists, this.props.playlists))
      return true;
    if(!lodash.isEqual(nextState, this.state))
      return true;
    return false;
  }

  @autobind
  private _onShare(e: React.MouseEvent<HTMLSpanElement>, title: string, url: string): void {
    var shareUrl: string = `${window.location.origin}${window.location.pathname}#${url}`;
    this.setState({
      shareUrl: shareUrl,
      hideShare: false
    });
  }

  @autobind
  private _closeShare(): void {
    this.setState({
      shareUrl: "",
      hideShare: true
    });
  }

  public render(): React.ReactElement<ISearchProps> {
    return (
      <div>
        <Breadcrumb
          className={styles.bodyHeading}
          items={this.state.navItems}
          onReduceData={undefined}
          ariaLabel={'Search Results breadcrumb'}
        />
        <div>
          {this.props.playlists && this.props.playlists.length > 0 &&
          this.props.playlists.map((playlist: IPlaylist) => {
            return(
              <SearchCard 
                cardId={playlist.Id}
                cardTitle={playlist.Title}
                cardImage={playlist.Image}
                shareTitle="Copy Link"
                shareUrl={`/playlist/${playlist.Id}`}
                onShare={this._onShare}
              />
            );
          })}
        </div>
        <ShareDialog 
          shareTitle={'Share Playlist'} 
          shareUrl={this.state.shareUrl} 
          hideShare={this.state.hideShare} 
          closeShare={this._closeShare} 
        />
      </div>
    );
  }
}
