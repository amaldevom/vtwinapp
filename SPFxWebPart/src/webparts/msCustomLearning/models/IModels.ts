import { IWebPartContext } from '@microsoft/sp-webpart-base';

export interface IServiceProperties{
  cdnBase: string;
  context: IWebPartContext;
  playlistListName: string;
  assetsListName: string;
}

export interface IChoice {
  key: string;
  text: string;
}

export interface ITechnology {
  Name: string;
  Image: string;
  Subjects: string[];
}

export interface IMetadataEntry {
  Name: string;
  Image: string;
}

//Additional Count parameter is used to manage category/subcategory visbility
export interface ISubCategory extends IMetadataEntry{
  Count?: number;
}

export interface IAudience extends IMetadataEntry{}
export interface IPath extends IMetadataEntry{}

//Additional Count parameter is used to manage category/subcategory visbility
export interface ICategory {
  Name: string;
  Security: string;
  SubCategories: ISubCategory[];
  Count?: number;
}

export interface IMetadata {
  Technologies: ITechnology[];
  Categories: ICategory[];
  Audiences: IAudience[];
  Sources: string[];
  Levels: string;
}

export interface IPlaylist {
  ['@odata.etag']?: string;
  Id: string;
  Title: string;
  Image: string;
  Level: string;
  Audience: string;
  Technology: string;
  Subject: string;
  Category: string;
  SubCategory: string;
  Source: string;
  Assets: string[];
}

export class Playlist implements IPlaylist {
  constructor(
    public Id: string = "0",
    public Title: string = "",
    public Image: string = "",
    public Level: string = "",
    public Audience: string = "",
    public Technology: string = "",
    public Subject: string = "",
    public Category: string = "",
    public SubCategory: string = "",
    public Source: string = "Tenant",
    public Assets: string[] = []    
  ){}
}

export interface IAsset {
  ['@odata.etag']?: string;
  Id: string;
  Title: string;
  Description: string;
  Url: string;
  Level: string;
  Audience: string;
  Technology: string;
  Subject: string;
  Category: string;
  SubCategory: string;
  Source: string;
}

export class Asset implements IAsset {
  constructor(
    public Id: string = "0",
    public Title: string = "",
    public Description: string = "",
    public Url: string = "",
    public Level: string = "",
    public Audience: string = "",
    public Technology: string = "",
    public Subject: string = "",
    public Category: string = "",
    public SubCategory: string = "",
    public Source: string = "Tenant"
  ) {}
}

export interface IFilter {
  key: string | number | undefined;
}
export interface IFilterPlaylists{
  Technology: ITechnology[];
  Search: string;
  Filters: string[];
}

export class FilterPlaylists implements IFilterPlaylists {
  constructor(
    public Technology: ITechnology[] = [],
    public Search: string = "",
    public Filters: string[] = []
  ){}
}