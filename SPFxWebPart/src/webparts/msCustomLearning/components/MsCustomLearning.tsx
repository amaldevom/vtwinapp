import * as React from 'react';
import * as lodash from 'lodash';
import { HashRouter, Route } from 'react-router-dom';
import CustomLearningApp from './CustomLearningApp';
import { IServiceProperties, ITechnology, IMetadata } from "../models/IModels";

export interface IMsCustomLearningProps {
  serviceProps: IServiceProperties;
  technologySelection: ITechnology[];
  metadata: IMetadata;
  userGroup: string;
}

export interface IMsCustomLearningState {
}

export class MsCustomLearning extends React.Component<IMsCustomLearningProps, IMsCustomLearningState> {
  public constructor(props: IMsCustomLearningProps){
    super(props);
  }

  public shouldComponentUpdate(nextProps: Readonly<IMsCustomLearningProps>, nextState: Readonly<IMsCustomLearningState>): boolean {
    if(!lodash.isEqual(nextProps.technologySelection, this.props.technologySelection))
      return true;
    if(!lodash.isEqual(nextState, this.state))
      return true;
    return false;
  }

  private _homeComp = (props) => {
    return (
      <CustomLearningApp
        serviceProps={this.props.serviceProps}
        technologySelection={this.props.technologySelection} 
        metadata={this.props.metadata} 
        userGroup={this.props.userGroup}
        {...props}
      />
    );
  }

  public render(): React.ReactElement<IMsCustomLearningProps> {
    return (
      <HashRouter>
        <Route path='/' render={this._homeComp}/>
      </HashRouter>
    );
  }
}
