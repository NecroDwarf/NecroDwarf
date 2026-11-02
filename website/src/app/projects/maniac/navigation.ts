import type { NavigationItem } from "../../shared/content/navigation";
import { wikiNavigation } from "./wiki/navigation";

const base = "/projects/maniac";
export const maniacNavigation: readonly NavigationItem[] = [
  { label: "Об игре", href: base },
  { label: "Wiki", href: `${base}/wiki`, children: wikiNavigation },
  { label: "Хроники", href: `${base}/changelog` },
  { label: "Геймплей", href: `${base}#gameplay` },
  { label: "Особенности", href: `${base}#features` },
  { label: "Персонажи", href: `${base}#characters` },
  { label: "Обновления", href: `${base}#updates` },
  { label: "Установка", href: `${base}#download` },
];
