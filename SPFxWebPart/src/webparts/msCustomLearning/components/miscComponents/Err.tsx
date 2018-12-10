import * as React from 'react';

import styles from "../MsCustomLearning.module.scss";

export interface IErrProps {
  errorMessage: string;
}

export class Err extends React.Component<IErrProps, {}> {
  private htmlString: any = { __html: "" };

  public render(): React.ReactElement<IErrProps> {
    this.htmlString.__html = this.props.errorMessage;
    return (
      <div className={styles.error} dangerouslySetInnerHTML={this.htmlString}></div>
    );
  }
}
