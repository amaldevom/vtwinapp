import * as React from 'react';
import * as lodash from 'lodash';
import { Link } from 'react-router-dom';
import styles from './card.module.scss';

import {IconButton} from 'office-ui-fabric-react/lib/Button';

export interface ISearchCardProps {
  cardId: string;
  cardTitle: string;
  cardImage: string;
  shareTitle: string;
  shareUrl: string;
  onShare: Function;
}

export default class SearchCard extends React.Component<ISearchCardProps, {}> {
  public shouldComponentUpdate(nextProps: Readonly<ISearchCardProps>){
    if (!lodash.isEqual(nextProps, this.props)) return true;
    return false;  
  }

  public render(): React.ReactElement<ISearchCardProps> {
    return(
      <div className={styles.smStackCard} key={this.props.cardId} >
        <div className={styles.cardImage} style={(this.props.cardImage)?{backgroundImage: `url(${this.props.cardImage})`}:{}}></div>
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