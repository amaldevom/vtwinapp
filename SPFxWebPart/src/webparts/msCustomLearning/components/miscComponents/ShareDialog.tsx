import * as React from 'react';
import * as lodash from 'lodash';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import { autobind } from '@uifabric/utilities/lib';

export interface IShareDialogProps {
  shareTitle: string;
  shareUrl: string;
  hideShare: boolean;
  closeShare: Function;
}

export interface IShareDialogState {
}

export class ShareDialogState implements IShareDialogState {
  constructor(
  ) {}
}

export default class ShareDialog extends React.Component<IShareDialogProps, IShareDialogState> {
  public constructor(props: IShareDialogProps){
    super(props);
    this.state = new ShareDialogState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IShareDialogProps>, nextState: Readonly<IShareDialogState>): boolean {
    if(!lodash.isEqual(nextProps, this.props))
      return true;
    return false;
  }

  @autobind
  private _closeShare(): void {
    this.props.closeShare();
  }

  public render(): React.ReactElement<IShareDialogProps> {
    return (
      <Dialog
        hidden={this.props.hideShare}
        onDismiss={this._closeShare}
        dialogContentProps={{
          type: DialogType.largeHeader,
          title: this.props.shareTitle,
          subText:
            'Copy the link to share with others.'
        }}
        modalProps={{
          isBlocking: true,
          containerClassName: 'ms-dialogMainOverride'
        }}
      >
        <Label>{this.props.shareUrl}</Label>
        <DialogFooter>
          <CopyToClipboard text={this.props.shareUrl} onCopy={this._closeShare} >
            <PrimaryButton text="Copy"/>
          </CopyToClipboard>
          <DefaultButton onClick={this._closeShare} text="Close" />
        </DialogFooter>
      </Dialog>
    );
  }
}
