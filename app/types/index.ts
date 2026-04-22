export interface Item {
  name: string;
  from: string;
  duration: number;
  class: string;
}

export interface ItemGroup {
  name: string;
  children: Item[];
}
