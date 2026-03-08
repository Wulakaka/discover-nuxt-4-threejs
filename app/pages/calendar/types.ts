export interface Item {
  name: string;
  from: string;
  duration: number;
}

export interface ItemGroup {
  name: string;
  children: Item[];
}
