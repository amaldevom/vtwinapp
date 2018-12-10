import * as React from 'react';
import * as lodash from 'lodash';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Image, IImageProps, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import styles from './playlists.module.scss';
import { IServiceProperties, IPlaylist, Playlist, IMetadata, ICategory, ISubCategory, IChoice, IAudience } from '../../models/IModels';
import { autobind } from '@uifabric/utilities/lib';
import { ICustomDataService, CustomDataService} from '../../services/CustomDataService';
import { Dropdown, IDropdownOption, IDropdownProps } from 'office-ui-fabric-react/lib/Dropdown';

export interface INewPlaylistRouterProps {
  playlistId: string;
}

export interface INewPlaylistProps extends RouteComponentProps<INewPlaylistRouterProps>{
  serviceProps: IServiceProperties;
  metadata: IMetadata;
  playlists: IPlaylist[];
  setErrorMessage: Function;
  goPlaylist(playlistId: string): void;
}

export interface INewPlaylistState{
  newPlaylist: IPlaylist;
  showImageSelector: boolean;
  toPlaylist: string;
  toHome: boolean;
  categoryList: IChoice[];
  subcategoryList: IChoice[];
  audienceList: IChoice[];
  levelList: IChoice[];
  categoryDropdownProps: IDropdownProps;
  subcategoryDropdownProps: IDropdownProps;
  audienceDropdownProps: IDropdownProps;
  levelDropdownProps: IDropdownProps;
}

export class NewPlaylistState implements INewPlaylistState {
  constructor(
    public newPlaylist: IPlaylist = null,
    public showImageSelector: boolean = true,
    public toPlaylist: string = "0",
    public toHome: boolean = false,
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

export default class NewPlaylist extends React.Component<INewPlaylistProps, INewPlaylistState> {
  private REQUIRED_FIELD = "This field is required.";
  private defaultImage: any = require('../../assets/Playlist_BW.png');

  public constructor(props: INewPlaylistProps){
    super(props);
    var state = new NewPlaylistState();

    var newPlaylist: Playlist = new Playlist();
    if(this.props.match.params.playlistId != undefined){
      newPlaylist = lodash.find(this.props.playlists, o => (o.Id === this.props.match.params.playlistId));
    }
    var categoryList: IChoice[] = lodash.reduce(this.props.metadata.Categories, 
      (result: IChoice[], value: ICategory) => { 
        result.push({key: value.Name, text: value.Name}); 
        return result;
      }, []);
    var subcategoryList: IChoice[] = [];
    if(newPlaylist.Category.length > 0){
      var category: ICategory = lodash.find(this.props.metadata.Categories, o => (o.Name === newPlaylist.Category));
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

    state.newPlaylist = newPlaylist;
    state.categoryList = categoryList;
    state.subcategoryList = subcategoryList;
    state.audienceList = audienceList;
    state.levelList = levelList;
    state.categoryDropdownProps.errorMessage = (newPlaylist.Category.length < 1?this.REQUIRED_FIELD:'');
    state.subcategoryDropdownProps.errorMessage = (newPlaylist.SubCategory.length < 1?this.REQUIRED_FIELD:'');
    state.audienceDropdownProps.errorMessage = (newPlaylist.Audience.length < 1?this.REQUIRED_FIELD:'');
    state.levelDropdownProps.errorMessage = (newPlaylist.Level.length < 1?this.REQUIRED_FIELD:'');

    this.state = state;
  }

  public shouldComponentUpdate(nextProps: Readonly<INewPlaylistProps>, nextState: Readonly<INewPlaylistState>): boolean {
    if(!lodash.isEqual(nextState, this.state))
      return true;
    return false;
  }

  @autobind
  private _onChangedName(text: string): void {
    var updatePlaylist: IPlaylist = this.state.newPlaylist;
    updatePlaylist.Title = text;
    this.setState({
      newPlaylist: updatePlaylist
    });
  }

  @autobind
  private _onChangedImageUrl(text: string): void {
    var updatePlaylist: IPlaylist = this.state.newPlaylist;
    updatePlaylist.Image = text;
    this.setState({
      newPlaylist: updatePlaylist
    });
  }

  @autobind
  private _chooseImageClicked(): void {
    this.setState({
      showImageSelector: false
    });
  }

  @autobind
  private _closeDialog(): void{
    this.setState({
      showImageSelector: true
    }); 
  }


  @autobind
  private _onCategoryChange(item: IDropdownOption): void {
    var updatePlaylist: IPlaylist = this.state.newPlaylist;
    updatePlaylist.Category = item.key as string;
    updatePlaylist.SubCategory = "";
    //cascade dropdown
    var category: ICategory = lodash.find(this.props.metadata.Categories, o => (o.Name === item.key));
    var subcategoryList: IChoice[] = lodash.reduce(category.SubCategories, 
      (result: IChoice[], value: ISubCategory) => { 
        result.push({key: value.Name, text: value.Name}); 
        return result;
      }, []);
    //validation
    var newCategoryProps = lodash.cloneDeep(this.state.categoryDropdownProps);
    newCategoryProps.errorMessage = (updatePlaylist.Category.length < 1) ? this.REQUIRED_FIELD : '';
    this.setState({
      newPlaylist: updatePlaylist,
      categoryDropdownProps: newCategoryProps,
      subcategoryList: subcategoryList
    });
  }

  @autobind
  private _onSubCategoryChange(item: IDropdownOption): void {
    var updatePlaylist: IPlaylist = this.state.newPlaylist;
    updatePlaylist.SubCategory = item.key as string;

    //validation
    var newSubCategoryProps = lodash.cloneDeep(this.state.subcategoryDropdownProps);
    newSubCategoryProps.errorMessage = (updatePlaylist.Category.length < 1) ? this.REQUIRED_FIELD : '';
    this.setState({
      newPlaylist: updatePlaylist,
      subcategoryDropdownProps: newSubCategoryProps
    });
  }

  @autobind
  private _onAudienceChange(item: IDropdownOption): void {
    var updatePlaylist: IPlaylist = this.state.newPlaylist;
    updatePlaylist.Audience = item.key as string;

    //validation
    var newAudienceProps = lodash.cloneDeep(this.state.audienceDropdownProps);
    newAudienceProps.errorMessage = (updatePlaylist.Audience.length < 1) ? this.REQUIRED_FIELD : '';
    this.setState({
      newPlaylist: updatePlaylist,
      audienceDropdownProps: newAudienceProps
    });
  }

  @autobind
  private _onLevelChange(item: IDropdownOption): void {
    var updatePlaylist: IPlaylist = this.state.newPlaylist;
    updatePlaylist.Level = item.key as string;

    //validation
    var newLevelProps = lodash.cloneDeep(this.state.levelDropdownProps);
    newLevelProps.errorMessage = (updatePlaylist.Level.length < 1) ? this.REQUIRED_FIELD : '';
    this.setState({
      newPlaylist: updatePlaylist,
      levelDropdownProps: newLevelProps  
    });
  }
  
  @autobind
  private _savePlaylist(): void {
    var dataService: ICustomDataService = new CustomDataService();
    var p: Promise<string> = null;
    if(this.state.newPlaylist.Id === "0")
      p = dataService.createPlaylist(this.props.serviceProps, this.state.newPlaylist);
    else
      p = dataService.modifyPlaylist(this.props.serviceProps, this.state.newPlaylist);

    //Resolve
    p.then((result: string) => {
      var playlistId: string = this.state.newPlaylist.Id;
      if(this.state.newPlaylist.Id === "0")
        playlistId = JSON.parse(result); 
      
      if(result !== "0"){
        this.props.goPlaylist(playlistId);
        //Redirect to playlist detail screen
        this.setState({
          toPlaylist: playlistId
        });
      }else{
        this.props.setErrorMessage("Could not create playlist.");
      }
    });
  }

  @autobind
  private _cancelForm(): void {
    if(this.state.newPlaylist.Id === "0")
      this.setState({toHome: true});
    else
      this.setState({toPlaylist: this.state.newPlaylist.Id});
  }

  @autobind
  private _getFormValid(): boolean {
    var retVal: boolean = true;
    if ((this.state.newPlaylist.Title.length < 1) ||
      (this.state.newPlaylist.Category.length < 1) ||
      (this.state.newPlaylist.SubCategory.length < 1) ||
      (this.state.newPlaylist.Audience.length < 1) ||
      (this.state.newPlaylist.Level.length < 1))
      retVal = false;

    return retVal;
  }

  public render(): React.ReactElement<INewPlaylistProps> {
    if (this.state.toPlaylist !== "0") {
      return <Redirect to={`/playlist/${this.state.toPlaylist}`} />;
    }

    if (this.state.toHome) {
      return <Redirect to={`/`} />;
    }

    const imageProps: IImageProps = {
      src: (this.state.newPlaylist.Image && this.state.newPlaylist.Image.length>0)?this.state.newPlaylist.Image:this.defaultImage,
      imageFit: ImageFit.cover
    };

    return (
      <div className={styles.form}>
        <div className={styles.formHeading}>Create New Playlist</div>
        <div>
          <TextField 
            label='Playlist Name'
            onChanged={this._onChangedName}
            value={this.state.newPlaylist.Title}
            required={true}
            onGetErrorMessage={() => { return this.state.newPlaylist.Title.length < 1 ? this.REQUIRED_FIELD : ''; }}
          />
        </div>
        <div className={styles.left}>
          <div>
            <Label>Playlist Image</Label>
            <Image
              {...imageProps as any}
              alt="Playlist image"
              width={280}
              height={200}
              imageFit={ImageFit.contain}
            />
            <DefaultButton
              className={styles.buttonMarginTop}
              text="Choose Image"
              disabled={true}
              onClick={this._chooseImageClicked}
              iconProps={{ iconName: 'Photo2Add' }}
            />
            <Dialog
              hidden={this.state.showImageSelector}
              onDismiss={this._closeDialog}
              dialogContentProps={{
                type: DialogType.normal,
                title: 'Enter image url',
                subText: ''
              }}
              modalProps={{
                isBlocking: false,
                containerClassName: 'ms-dialogMainOverride'
              }}
            >
              <TextField 
                label='Playlist Image Url'
                onChanged={this._onChangedImageUrl}
              />
              <DialogFooter>
                <PrimaryButton onClick={this._closeDialog} text="Save" />
                <DefaultButton onClick={this._closeDialog} text="Cancel" />
              </DialogFooter>
            </Dialog>
          </div>
        </div><div className={styles.right}>
          <Dropdown
            placeHolder='Select Category'
            label='Assign to playlist category:'
            selectedKey={this.state.newPlaylist.Category}
            onChanged={this._onCategoryChange}
            required={true}
            options={this.state.categoryList}
            errorMessage={this.state.categoryDropdownProps && this.state.categoryDropdownProps.errorMessage}
          />
          <Dropdown 
            placeHolder='Select Sub-Category'
            label='Assign to playlist sub-category:'
            selectedKey={this.state.newPlaylist.SubCategory}
            onChanged={this._onSubCategoryChange}
            required={true}
            options={this.state.subcategoryList}
            errorMessage={this.state.subcategoryDropdownProps && this.state.subcategoryDropdownProps.errorMessage}
          />
          <Dropdown 
            placeHolder='Select Audience'
            label='Audience:'
            selectedKey={this.state.newPlaylist.Audience}
            onChanged={this._onAudienceChange}
            required={true}
            options={this.state.audienceList}
            errorMessage={this.state.audienceDropdownProps && this.state.audienceDropdownProps.errorMessage}
          />
          <Dropdown 
            placeHolder='Select Level'
            label='Level:'
            selectedKey={this.state.newPlaylist.Level}
            onChanged={this._onLevelChange}
            required={true}
            options={this.state.levelList}
            errorMessage={this.state.levelDropdownProps && this.state.levelDropdownProps.errorMessage}
          />
        </div>
        <div className={styles.alignRight}>
          <PrimaryButton
            className={styles.buttonMarginRight}
            text={this.state.newPlaylist.Id === "0"? "Create" : "Update"}
            disabled={!this._getFormValid()}
            onClick={this._savePlaylist}
          />
          <DefaultButton
            text="Cancel"
            onClick={this._cancelForm} 
          />
        </div>
      </div>
    );
  }
}