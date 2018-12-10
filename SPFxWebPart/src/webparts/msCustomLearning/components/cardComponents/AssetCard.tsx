import * as React from 'react';
import * as lodash from 'lodash';
import styles from './card.module.scss';

import {IconButton} from 'office-ui-fabric-react/lib/Button';

export interface IAssetCardProps {
  cardId: string;
  cardIndex: number;
  cardTitle: string;
  cardDescription: string;
  onSelect: Function;
  deleteEnabled: boolean;
  onDelete(assetId: string): void;
  editEnabled: boolean;
  onEdit(assetId: string): void;
  selected: boolean;
}

export default class AssetCard extends React.Component<IAssetCardProps, {}> {
  public shouldComponentUpdate(nextProps: Readonly<IAssetCardProps>){
    if (!lodash.isEqual(nextProps, this.props)) return true;
    return false;  
  }

  public render(): React.ReactElement<IAssetCardProps> {
    return(
      <div className={styles.smStackCard + (this.props.selected?` ${styles.selected}`: '')} key={this.props.cardId} onClick={(e: React.MouseEvent<HTMLSpanElement>) => {this.props.onSelect(e, this.props.cardIndex);}}>
        <div className={styles.cardTitleCont}>
          <div className={styles.cardTitle}>{this.props.cardTitle}</div>
          {this.props.deleteEnabled &&
          <IconButton
            className={styles.cardIcon}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {this.props.onDelete(this.props.cardId);}}
            iconProps={{ iconName: 'Delete' }}
            title={'Delete Asset from Playlist'}
            ariaLabel={'DeleteAsset'}
          />
          }
          {this.props.editEnabled &&
          <IconButton
            className={styles.cardIcon}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {this.props.onEdit(this.props.cardId);}}
            iconProps={{ iconName: 'Edit' }}
            title={'Edit Asset'}
            ariaLabel={'EditAsset'}
          />
          }
        </div>
      </div>
    );
  }
}