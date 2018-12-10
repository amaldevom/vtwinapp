import * as React from 'react';
import * as lodash from 'lodash';
import { Link, RouteComponentProps } from 'react-router-dom';
import styles from './card.module.scss';

import {IconButton} from 'office-ui-fabric-react/lib/Button';
import { autobind } from '../../../../../node_modules/@uifabric/utilities/lib';

export interface ILargeCardProps extends RouteComponentProps<{}> {
  cardId: string;
  cardTitle: string;
  cardImage: string;
  shareTitle: string;
  shareUrl: string;
  onShare: Function;
}

export default class LargeCard extends React.Component<ILargeCardProps, {}> {
  public shouldComponentUpdate(nextProps: Readonly<ILargeCardProps>){
    if (!lodash.isEqual(nextProps, this.props)) return true;
    return false;  
  }

  @autobind
  private _goLink() {
    this.props.history.push(this.props.shareUrl);
  }

  public render(): React.ReactElement<ILargeCardProps> {
    return(
      <div className={styles.lgCard} key={this.props.cardId}>
        <div className={styles.cardImage}
          onClick={this._goLink} 
          style={(this.props.cardImage)?{backgroundImage: `url(${this.props.cardImage})`}:{}}></div>
        <div className={styles.cardTitleCont}>
          <div className={styles.cardTitle}>
            <Link to={this.props.shareUrl} className={styles.cardLink}>{this.props.cardTitle}</Link>
          </div>
          <IconButton
            className={styles.cardIcon}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {this.props.onShare(e, this.props.shareTitle, this.props.shareUrl);}}
            iconProps={{ iconName: 'Share' }}
            title={this.props.shareTitle}
            ariaLabel={this.props.shareTitle}
          />
        </div>
      </div>
    );
  }
}