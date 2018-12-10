import * as React from 'react';
import * as lodash from 'lodash';
import { RouteComponentProps } from 'react-router';
import styles from "./MsCustomLearning.module.scss";

import { autobind } from '@uifabric/utilities/lib';
import { ITechnology, ICategory, IPlaylist, ISubCategory } from '../models/IModels';
import ShareDialog from './miscComponents/ShareDialog';
import LargeCard from './cardComponents/LargeCard';

export interface IHomeProps extends RouteComponentProps<{}>{
  userGroup: string;
  technologySelection: ITechnology[];
  categories: ICategory[];
  setErrorMessage: Function;
}

export interface IHomeState {
  shareTitle: string;
  shareUrl: string;
  hideShare: boolean;
}

export class HomeState implements IHomeState {
  constructor(
    public shareTitle: string = "",
    public shareUrl: string = "",
    public hideShare: boolean = true
  ) {}
}

export default class Home extends React.Component<IHomeProps, IHomeState> {
  public constructor(props: IHomeProps){
    super(props);
    this.state = new HomeState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IHomeProps>, nextState: Readonly<IHomeState>): boolean {
    if(!lodash.isEqual(nextProps.technologySelection, this.props.technologySelection) ||
    !lodash.isEqual(nextProps.categories, this.props.categories))
      return true;
    if(!lodash.isEqual(nextState, this.state))
      return true;
    return false;
  }

  @autobind
  private _checkSecurity(security: string): boolean{
    var retVal: boolean = false;
    switch(security) {
      case "Owners":
        retVal = (this.props.userGroup == "Owners");
        break;
      case "Members":
        retVal = ((this.props.userGroup == "Owners") || (this.props.userGroup == "Members"));
        break;
      case "Visitors":
        retVal = ((this.props.userGroup == "Owners") || (this.props.userGroup == "Members") || (this.props.userGroup == "Visitors"));
        break;
    }
    return retVal;
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

  public render(): React.ReactElement<IHomeProps> {
    return (
      <div className={styles.homeCont}>
        {/* Metadata Categories */}
        {this.props.categories && this.props.categories.map((cat) => {
          return(
            <div>
              {cat.Count > 0 && this._checkSecurity(cat.Security) && 
              <div>
                <div className={styles.bodyHeading}>{cat.Name}</div>
                <div className={styles.homeCardCont}>
                  {cat.SubCategories && cat.SubCategories.map((sub: ISubCategory) => {
                    return(
                      <div>
                        {sub.Count > 0 && 
                        <LargeCard 
                          cardId={sub.Name}
                          cardTitle={sub.Name}
                          cardImage={sub.Image}
                          shareTitle="Copy Link"
                          shareUrl={`/category/${cat.Name}/${sub.Name}`}
                          onShare={this._onShare}
                          {...this.props}
                        />
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
              }
            </div>
          );
        })}
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