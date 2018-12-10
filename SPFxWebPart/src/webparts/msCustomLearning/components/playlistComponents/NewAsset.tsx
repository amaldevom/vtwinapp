import * as React from 'react';
import * as lodash from 'lodash';

import styles from './playlists.module.scss';

import { IMetadata, IServiceProperties, IAsset, Asset, IPlaylist, IChoice, ICategory, IAudience, ISubCategory } from '../../models/IModels';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption, IDropdownProps } from 'office-ui-fabric-react/lib/Dropdown';
import { autobind } from '@uifabric/utilities/lib';
import { ICustomDataService, CustomDataService } from '../../services/CustomDataService';

export interface INewAssetProps {
  metadata: IMetadata;
  serviceProps: IServiceProperties;
  setErrorMessage: Function;
  refreshAssets(): void;
  currentPlaylist: IPlaylist;
  closeAsset: Function;
  currentAsset: IAsset;
}

export interface INewAssetState{
  newAsset: IAsset;
  categoryList: IChoice[];
  subcategoryList: IChoice[];
  audienceList: IChoice[];
  levelList: IChoice[];
  categoryDropdownProps: IDropdownProps;
  subcategoryDropdownProps: IDropdownProps;
  audienceDropdownProps: IDropdownProps;
  levelDropdownProps: IDropdownProps;
}

export class NewAssetState implements INewAssetState {
  constructor(
    public newAsset: IAsset = null,
    public categoryList: IChoice[] = null,
    public subcategoryList: IChoice[] = null,
    public audienceList: IChoice[] = null,
    public levelList: IChoice[] = null,
    public categoryDropdownProps: IDropdownProps = { errorMessage: ''},
    public subcategoryDropdownProps: IDropdownProps = { errorMessage: ''},
    public audienceDropdownProps: IDropdownProps = { errorMessage: ''},
    public levelDropdownProps: IDropdownProps = { errorMessage: ''}
  ) {}
}

export default class NewAsset extends React.Component<INewAssetProps, INewAssetState> {
  private REQUIRED_FIELD = "This field is required.";
  
  public constructor(props: INewAssetProps){
    super(props);
    var state = new NewAssetState();
  
    var newAsset: IAsset = new Asset();
    if(this.props.currentAsset != undefined){
      newAsset = lodash.cloneDeep(this.props.currentAsset);
    }else{
      newAsset.Category = this.props.currentPlaylist.Category;
      newAsset.SubCategory = this.props.currentPlaylist.SubCategory;
    }
    var categoryList: IChoice[] = lodash.reduce(this.props.metadata.Categories, 
      (result: IChoice[], value: ICategory) => { 
        result.push({key: value.Name, text: value.Name}); 
        return result;
      }, []);
    var subcategoryList: IChoice[] = [];
    if(newAsset.Category.length > 0){
      var category: ICategory = lodash.find(this.props.metadata.Categories, o => (o.Name === newAsset.Category));
      subcategoryList = lodash.reduce(category.SubCategories, 
        (result: IChoice[], value: ISubCategory) => { 
          result.push({key: value.Name, text: value.Name}); 
          return result;
        }, []);
    }
    var audienceList: IChoice[] = lodash.reduce(this.props.metadata.Audiences, 
      (result: IChoice[], value: IAudience) => { 
        result.push({key: value.Name, text: value.Name}); 
        return result;
      }, []);
    var levelList: IChoice[] = lodash.reduce(this.props.metadata.Levels, 
      (result: IChoice[], value: string) => { 
        result.push({key: value, text: value}); 
        return result;
      }, []);

    state.newAsset = newAsset;
    state.categoryList = categoryList;
    state.subcategoryList = subcategoryList;
    state.audienceList = audienceList;
    state.levelList = levelList;
    state.categoryDropdownProps.errorMessage = (newAsset.Category.length < 1?this.REQUIRED_FIELD:'');
    state.subcategoryDropdownProps.errorMessage = (newAsset.SubCategory.length < 1?this.REQUIRED_FIELD:'');
    state.audienceDropdownProps.errorMessage = (newAsset.Audience.length < 1?this.REQUIRED_FIELD:'');
    state.levelDropdownProps.errorMessage = (newAsset.Level.length < 1?this.REQUIRED_FIELD:'');

    this.state = state;
  }

  public shouldComponentUpdate(nextProps: Readonly<INewAssetProps>, nextState: Readonly<INewAssetState>): boolean {
    if(!lodash.isEqual(nextState, this.state))
      return true;
    return false;
  }

  @autobind
  private _onChangedTitle(text: string): void {
    var updateAsset: IAsset = this.state.newAsset;
    updateAsset.Title = text;
    this.setState({
      newAsset: updateAsset
    });
  }

  @autobind
  private _onChangedUrl(text: string): void {
    var updateAsset: IAsset = this.state.newAsset;
    updateAsset.Url = text;
    this.setState({
      newAsset: updateAsset
    });
  }

  @autobind
  private _onChangedDescription(text: string): void {
    var updateAsset: IAsset = this.state.newAsset;
    updateAsset.Description = text;
    this.setState({
      newAsset: updateAsset
    });
  }

  @autobind
  private _onCategoryChange(item: IDropdownOption): void {
    var updateAsset: IAsset = this.state.newAsset;
    updateAsset.Category = item.key as string;
    updateAsset.SubCategory = "";
    //cascade dropdown
    var category: ICategory = lodash.find(this.props.metadata.Categories, o => (o.Name === item.key));
    var subcategoryList: IChoice[] = lodash.reduce(category.SubCategories, 
      (result: IChoice[], value: ISubCategory) => { 
        result.push({key: value.Name, text: value.Name}); 
        return result;
      }, []);
    //validation
    var newCategoryProps = lodash.cloneDeep(this.state.categoryDropdownProps);
    newCategoryProps.errorMessage = (updateAsset.Category.length < 1) ? 'This field is required' : '';
    this.setState({
      newAsset: updateAsset,
      categoryDropdownProps: newCategoryProps,
      subcategoryList: subcategoryList
    });
  }

  @autobind
  private _onSubCategoryChange(item: IDropdownOption): void {
    var updateAsset: IAsset = this.state.newAsset;
    updateAsset.SubCategory = item.key as string;

    //validation
    var newSubCategoryProps = lodash.cloneDeep(this.state.subcategoryDropdownProps);
    newSubCategoryProps.errorMessage = (updateAsset.Category.length < 1) ? 'This field is required' : '';
    this.setState({
      newAsset: updateAsset,
      subcategoryDropdownProps: newSubCategoryProps
    });
  }

  @autobind
  private _onAudienceChange(item: IDropdownOption): void {
    var updateAsset: IAsset = this.state.newAsset;
    updateAsset.Audience = item.key as string;

    //validation
    var newAudienceProps = lodash.cloneDeep(this.state.audienceDropdownProps);
    newAudienceProps.errorMessage = (updateAsset.Audience.length < 1) ? 'This field is required' : '';
    this.setState({
      newAsset: updateAsset,
      audienceDropdownProps: newAudienceProps
    });
  }

  @autobind
  private _onLevelChange(item: IDropdownOption): void {
    var updateAsset: IAsset = this.state.newAsset;
    updateAsset.Level = item.key as string;

    //validation
    var newLevelProps = lodash.cloneDeep(this.state.levelDropdownProps);
    newLevelProps.errorMessage = (updateAsset.Level.length < 1) ? 'This field is required' : '';
    this.setState({
      newAsset: updateAsset,
      levelDropdownProps: newLevelProps  
    });
  }

  @autobind
  private _getFormValid(): boolean {
    var retVal: boolean = true;
    if ((this.state.newAsset.Title.length < 1) ||
      (this.state.newAsset.Url.length < 1) ||
      (this.state.newAsset.Category.length < 1) ||
      (this.state.newAsset.SubCategory.length < 1) ||
      (this.state.newAsset.Audience.length < 1) ||
      (this.state.newAsset.Level.length < 1))
      retVal = false;

    return retVal;
  }

  @autobind
  private _saveAsset(): void {
    var newAssetId: string = "";
    var dataService: ICustomDataService = new CustomDataService();
    var currentPlaylist: IPlaylist = lodash.cloneDeep(this.props.currentPlaylist);
    var newAsset: IAsset = lodash.cloneDeep(this.state.newAsset);
    var p: Promise<string | boolean> = null;
    if(newAsset.Id === "0")
      p = dataService.createAsset(this.props.serviceProps, newAsset);
    else
      p = dataService.modifyAsset(this.props.serviceProps, newAsset);

    p.then((result: string) => {
      if(newAsset.Id === "0"){
        newAssetId = result;
        currentPlaylist.Assets.push(result);
        return dataService.modifyPlaylist(this.props.serviceProps, currentPlaylist);
      }else{
        this.props.refreshAssets();
      }      
    })
    .then((result: string) => {
      if(result !== "0"){
        this.props.refreshAssets();
      }else
        this.props.setErrorMessage("Could not create asset.");
    });
  }

  public render(): React.ReactElement<INewAssetProps> {
    return (
      <div className={styles.form}>
        <TextField
          label="Asset Title"
          required={true}
          value={this.state.newAsset.Title}
          onChanged={this._onChangedTitle}
          onGetErrorMessage={() => { return this.state.newAsset.Title.length < 1 ? 'This field is required.' : ''; }}
        />
        <TextField
          label="Asset Content"
          multiline 
          rows={4}
          required={true}
          value={this.state.newAsset.Url}
          onChanged={this._onChangedUrl}
          description={'Add the url of a SharePoint page.'}
          onGetErrorMessage={() => { return this.state.newAsset.Url.length < 1 ? 'This field is required.' : ''; }}
        />
        <Dropdown
            placeHolder='Select Category'
            label='Assign to playlist category:'
            disabled={(this.state.newAsset.Id === "0")}
            selectedKey={this.state.newAsset.Category}
            onChanged={this._onCategoryChange}
            required={true}
            options={this.state.categoryList}
            errorMessage={this.state.categoryDropdownProps && this.state.categoryDropdownProps.errorMessage}
          />
          <Dropdown 
            placeHolder='Select Sub-Category'
            label='Assign to playlist sub-category:'
            disabled={(this.state.newAsset.Id === "0")}
            selectedKey={this.state.newAsset.SubCategory}
            onChanged={this._onSubCategoryChange}
            required={true}
            options={this.state.subcategoryList}
            errorMessage={this.state.subcategoryDropdownProps && this.state.subcategoryDropdownProps.errorMessage}
          />
          <Dropdown 
            placeHolder='Select Audience'
            label='Audience:'
            selectedKey={this.state.newAsset.Audience}
            onChanged={this._onAudienceChange}
            required={true}
            options={this.state.audienceList}
            errorMessage={this.state.audienceDropdownProps && this.state.audienceDropdownProps.errorMessage}
          />
          <Dropdown 
            placeHolder='Select Level'
            label='Level:'
            selectedKey={this.state.newAsset.Level}
            onChanged={this._onLevelChange}
            required={true}
            options={this.state.levelList}
            errorMessage={this.state.levelDropdownProps && this.state.levelDropdownProps.errorMessage}
          />
        <div className={styles.footer}>
          <PrimaryButton
            text={this.state.newAsset.Id === "0"? "Create" : "Update"}
            disabled={!this._getFormValid()}
            onClick={this._saveAsset}
          />
          <DefaultButton
            text="Cancel"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {this.props.closeAsset(e);}}
          />
        </div>
      </div>
    );
  }
}