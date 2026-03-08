import type {ItemGroup} from "./types";

export const list: ItemGroup[] = [
  {
    name: "星期一",
    children: [
      {
        name: "画画",
        from: "16:45",
        duration: 90,
        class: "bg-blue-500",
      },
      {
        name: "打鼓",
        from: "18:45",
        duration: 50,
        class: "bg-green-500",
      },
    ],
  },
  {
    name: "星期二",
    children: [
      {
        name: "拼音",
        from: "18:30",
        duration: 60,
        class: "bg-purple-500",
      },
    ],
  },
  {
    name: "星期三",
    children: [],
  },
  {
    name: "星期四",
    children: [
      {
        name: "英语",
        from: "16:45",
        duration: 90,
        class: "bg-yellow-500",
      },
    ],
  },
  {
    name: "星期五",
    children: [],
  },
  {
    name: "星期六",
    children: [
      {
        name: "英语",
        from: "10:30",
        duration: 90,
        class: "bg-yellow-500",
      },
      {
        name: "口才",
        from: "16:45",
        duration: 60,
        class: "bg-blue-300",
      },
      {
        name: "打鼓",
        from: "19:30",
        duration: 50,
        class: "bg-green-500",
      },
    ],
  },
  {
    name: "星期日",
    children: [
      {
        name: "游泳",
        from: "10:40",
        duration: 45,
        class: "bg-cyan-500",
      },
      {
        name: "拼音",
        from: "17:00",
        duration: 60,
        class: "bg-purple-500",
      },
    ],
  },
];
