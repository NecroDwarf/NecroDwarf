import { ContentLink } from "../../../shared/ui/ContentLink";
import { GoogleDriveIcon, YandexDiskIcon } from "../assets/DownloadIcons";
import { download } from "../content";
import s from "./ManiacPage.module.css";

export function DownloadActions() {
  return (
    <>
      <ContentLink
        className={s.primary}
        href={download.url}
        aria-label={`Скачать Maniac ${download.version} с Google Drive`}
      >
        <span className={s.downloadLabel}>
          <GoogleDriveIcon />
          <span>Скачать Maniac {download.version}</span>
        </span>
        <span aria-hidden="true">↗</span>
      </ContentLink>
      <ContentLink className={s.secondary} href={download.mirrorUrl}>
        <span className={s.downloadLabel}>
          <YandexDiskIcon />
          <span>Скачать с Яндекс Диска</span>
        </span>{" "}
        <span aria-hidden="true">↗</span>
      </ContentLink>
    </>
  );
}
