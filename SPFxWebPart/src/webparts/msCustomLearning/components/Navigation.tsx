import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import * as lodash from 'lodash';
import styles from "./MsCustomLearning.module.scss";

import { IFilterPlaylists, FilterPlaylists, IMetadata, IServiceProperties, ITechnology } from '../models/IModels';

import { Nav, INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/Nav';
import { autobind } from '@uifabric/utilities/lib';
import { DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import {SearchBox} from 'office-ui-fabric-react/lib/SearchBox';

export interface INavigationProps {
  serviceProps: IServiceProperties;
  userGroup: string;
  technologySelection: ITechnology[];
  metadata: IMetadata;
  setFilteredPlaylist(filter: IFilterPlaylists, location?: string): void;
  setErrorMessage: Function;
}

export interface INavigationState {
  showMenu: boolean;
  filterPlaylists: IFilterPlaylists;
  doSearch: boolean;
}

export class NavigationState implements INavigationState{
  constructor (
    public showMenu: boolean = false,
    public filterPlaylists: IFilterPlaylists = new FilterPlaylists(),
    public doSearch: boolean = false
  ) {}
}

export class Navigation extends React.Component<INavigationProps, INavigationState> {
  private navigationLinks: INavLinkGroup[];
  private filterOptions: IDropdownOption[];

  public constructor(props: RouteComponentProps<{}> & INavigationProps){
    super(props);
    var state = new NavigationState();
    state.filterPlaylists.Technology = this.props.technologySelection;
    this.state = state;
    this._setFilterOptions();
    this._setNavigation(this.props);
  }

  @autobind
  private _openPropertyPane(event){
    this.props.serviceProps.context.propertyPane.open();
    this._showMenu();
  }

  private _setFilterOptions(): void {
    this.filterOptions = [];
    this.filterOptions.push({ key: 'Audience', text: 'By Audience', itemType: DropdownMenuItemType.Header });
    for(var i=0; i<this.props.metadata.Audiences.length; i++){
      this.filterOptions.push({ key: `Audience-${this.props.metadata.Audiences[i].Name}`, text: this.props.metadata.Audiences[i].Name});
    }
    this.filterOptions.push({ key: 'divider_2', text: '-', itemType: DropdownMenuItemType.Divider });
    this.filterOptions.push({ key: 'Level', text: 'By Level', itemType: DropdownMenuItemType.Header });
    for(var j=0; j<this.props.metadata.Levels.length; j++){
      this.filterOptions.push({ key: `Level-${this.props.metadata.Levels[j]}`, text: this.props.metadata.Levels[j]});
    }
  }

  private _setNavigation(nextProps: INavigationProps): void {
    const adminLinks = {
      name: 'Admin',
      url: '#/',
      links: [
        {
          name: 'Create a Playlist',
          url: '#/playlist/add',
          key: 'AddPlaylist'
        },
        {
          name: 'Hide/Show Technologies',
          url: '',
          key: 'ConfigureWebPart'
        }
      ],
      isExpanded: true
    };
    const homeLinks = { name: 'Browse', url: '#/', key: 'Browse', isExpanded: true };
    this.navigationLinks = [{links: []}];
    if(nextProps.userGroup === "Owners")
      this.navigationLinks[0].links.push(adminLinks);
    this.navigationLinks[0].links.push(homeLinks);
  }

  public shouldComponentUpdate(nextProps: Readonly<INavigationProps>, nextState: Readonly<INavigationState>): boolean {
    if(nextProps.userGroup != this.props.userGroup){
      this._setNavigation(nextProps);
      return true;
    }
    if(!lodash.isEqual(nextState, this.state))
      return true;
    return false;
  }

  @autobind
  private _showMenu(): void {
    var currentState = this.state.showMenu;
    this.setState({
      showMenu: !currentState
    });
  }

  @autobind
  private _onNavClick(e: React.MouseEvent<HTMLElement>, item: INavLink) {
    switch(item.key){
      case "ConfigureWebPart":
        this._openPropertyPane(e);
        break;
      default:
        this.setState({showMenu: false});
        break;
    }
  }

  @autobind
  private _onSearch(search: string): void{
    var newFilterPlaylists: IFilterPlaylists = lodash.cloneDeep(this.state.filterPlaylists);
    newFilterPlaylists.Search = search;
    this.setState({
      filterPlaylists: newFilterPlaylists
    }, () => {
      this.props.setFilteredPlaylist(this.state.filterPlaylists, '/search');
    });
  }
  
  @autobind
  private _onChangeFilter(option: IDropdownOption, index?: number): void {
    var newFilterPlaylists: IFilterPlaylists = lodash.cloneDeep(this.state.filterPlaylists);
    var newFil: number = lodash.findIndex(this.state.filterPlaylists.Filters, o => (o === option.key));
    if(option.selected){
      newFilterPlaylists.Filters.push(option.key as string);
    }else{
      var filterIdx: number = newFilterPlaylists.Filters.indexOf(option.key as string);
      if(filterIdx > -1)
        newFilterPlaylists.Filters.splice(filterIdx,1);
    }
    this.setState({
      filterPlaylists: newFilterPlaylists
    }, () => {
      this.props.setFilteredPlaylist(this.state.filterPlaylists);
    });
  }

  @autobind
  private _resetFilter(): void {
    var newFilterPlaylists: IFilterPlaylists = lodash.cloneDeep(this.state.filterPlaylists);
    newFilterPlaylists.Filters = [];
    this.setState({
      filterPlaylists: newFilterPlaylists
    }, () => {
      this.props.setFilteredPlaylist(this.state.filterPlaylists);
    });
  }

  public render(): JSX.Element {
    return (
      <div className={styles.nav}>
        <span onClick={this._showMenu}><i className="ms-Icon ms-Icon--GlobalNavButton" aria-hidden="true"></i></span>
        <div className={styles.menu + ' ' + ((this.state.showMenu)?styles.show:'')}>
          <Nav
            groups={this.navigationLinks}
            expandedStateText={'expanded'}
            collapsedStateText={'collapsed'}
            onLinkClick={this._onNavClick}
          />
        </div>
        <div className={styles.search}>
          <SearchBox
            placeholder="Search training content"
            onSearch={this._onSearch}
            onClear={this._onSearch}
          />
        </div>
        <div className={styles.filter}>
          <div className={styles.dropdown}>
          {/* <Dropdown
            placeHolder="Filter By"
            selectedKeys={this.state.filterPlaylists.Filters}
            onChanged={this._onChangeFilter}
            multiSelect
            options={this.filterOptions}
          /> */}
          </div>
          {/* <IconButton
            className={styles.iconbutton}
            hidden={this.state.filterPlaylists.Filters.length < 1}
            onClick={this._resetFilter}
            iconProps={{ iconName: 'Cancel' }}
            title="Reset Filter(s)"
            ariaLabel="ResetFilters"
          /> */}
        </div>
      </div>
    );
  }
}
