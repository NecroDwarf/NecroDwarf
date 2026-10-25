import { ContentLink } from "../../../shared/ui/ContentLink";
import { Link } from "react-router";
import { ProjectIntro } from "../../../shared/ui/ProjectIntro";
import { ProjectGallery } from "../../../shared/ui/ProjectGallery";
import { ReleaseList } from "../../../shared/ui/ReleaseList";
import { SectionHeading } from "../../../shared/ui/SectionHeading";
import { contacts } from "../../../shared/content/team";
import { meta } from "../meta";
import { releases } from "../changelogs/registry";
import { GoogleDriveIcon, YandexDiskIcon } from "../assets/DownloadIcons";
import {
  characters,
  download,
  features,
  gameplay,
  installation,
} from "../content";
import theme from "../theme/theme.module.css";
import c from "../../../shared/ui/Content.module.css";
import s from "./ManiacPage.module.css";
export function ManiacPage() {
  const published = releases
    .filter((release) => release.status === "published")
    .sort((a, b) => b.releaseOrder - a.releaseOrder);
  const [latest, ...previous] = published;
  const { gallery, ...intro } = meta;
  return (
    <div className={`${theme.page} ${s.page}`}>
      <div className={s.hero}>
        <ProjectIntro project={intro}>
          <div className={s.actions}>
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
            {published.length > 0 && (
              <ContentLink className={s.secondary} href="#updates">
                История обновлений <span aria-hidden="true">↓</span>
              </ContentLink>
            )}
          </div>
          <p className={s.heroNote}>
            Minecraft {download.minecraft} · {download.loader} ·{" "}
            {download.releaseName} · Google Drive
          </p>
        </ProjectIntro>
      </div>

      <nav className={s.contents} aria-label="Разделы Maniac">
        <ContentLink href="#gameplay">Геймплей</ContentLink>
        {features.length > 0 && (
          <ContentLink href="#features">Особенности</ContentLink>
        )}
        {characters.length > 0 && (
          <ContentLink href="#characters">Персонажи</ContentLink>
        )}
        {gallery?.length ? (
          <ContentLink href="#gallery">Галерея</ContentLink>
        ) : null}
        {published.length > 0 && (
          <ContentLink href="#updates">Обновления</ContentLink>
        )}
        <ContentLink href="#download">Установка</ContentLink>
      </nav>

      <section id="gameplay" className={`${c.section} ${s.section}`}>
        <SectionHeading
          index="01"
          label="Геймплей"
          title={
            <>
              Две стороны.
              <br />
              Одна охота.
            </>
          }
        />
        <p className={s.lead}>{gameplay.description}</p>
        <div className={s.roles}>
          {gameplay.roles.map((role) => (
            <article
              key={role.id}
              className={`${s.role} ${role.id === "maniacs" ? s.hunters : s.survivors}`}
            >
              <p className={s.kicker}>{role.label}</p>
              <h3>{role.motto}</h3>
              <p>{role.description}</p>
              <ul>
                {role.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {features.length > 0 && (
        <section id="features" className={`${c.section} ${s.section}`}>
          <SectionHeading
            index="02"
            label="Особенности"
            title={
              <>
                Ваш стиль.
                <br />
                Ваш способ выжить.
              </>
            }
          />
          <div className={s.features}>
            {features.map((feature, index) => (
              <article className={s.feature} key={feature.title}>
                <span className={s.number} aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {characters.length > 0 && (
        <section id="characters" className={`${c.section} ${s.section}`}>
          <SectionHeading
            index="03"
            label="Персонажи"
            title="У каждого — свой кошмар."
          />
          <p className={s.lead}>
            Несколько знакомых лиц из «Кошмарного додепа». Разные роли, разные
            способы изменить ход матча.
          </p>
          <div className={s.characters}>
            {characters.map((character) => (
              <article className={s.character} key={character.name}>
                <p className={s.kicker}>{character.role}</p>
                <h3>{character.name}</h3>
                <p className={s.style}>{character.style}</p>
                <p>{character.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {gallery?.length ? (
        <section id="gallery" className={`${c.section} ${s.section}`}>
          <SectionHeading
            index="04"
            label="Внутри игры"
            title="Места, где начинается охота."
          />
          <ProjectGallery images={gallery} />
        </section>
      ) : null}

      {latest && (
        <section id="updates" className={`${c.section} ${s.section}`}>
          <SectionHeading
            index={gallery?.length ? "05" : "04"}
            label="История обновлений"
            title="Охота меняется."
            action={<Link to="/changelog">Все обновления ↗</Link>}
          />
          <article className={`${s.latest} ${latest.theme}`}>
            {latest.background && (
              <img
                className={s.flowerArt}
                src={latest.background.src}
                width={latest.background.width}
                height={latest.background.height}
                alt=""
                loading="lazy"
                decoding="async"
              />
            )}
            <div className={s.latestCopy}>
              <p className={s.kicker}>
                Последний опубликованный выпуск{" "}
                <span className={s.releaseVersion}>{latest.version}</span>
              </p>
              <h3>{latest.title}</h3>
              <p>{latest.summary}</p>
              <Link
                className={s.flowerLink}
                to="/changelog"
                aria-label={`История обновлений Maniac ${latest.version} — ${latest.title}`}
              >
                История обновлений <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
          <ReleaseList
            releases={previous}
            projectNames={{ [meta.id]: meta.name }}
            sourceHref="/changelog"
            sourceLabel="История обновлений"
          />
        </section>
      )}

      <section id="download" className={`${c.section} ${s.section}`}>
        <SectionHeading
          index={gallery?.length ? "06" : "05"}
          label="Скачивание и установка"
          title={
            <>
              Соберите компанию.
              <br />
              Начните матч.
            </>
          }
        />
        <div className={s.download}>
          <div className={s.downloadCopy}>
            <p className={s.kicker}>
              Minecraft {download.minecraft} / {download.loader}
            </p>
            <h3>Сборка, моды и карта</h3>
            <p>
              Maniac {download.version} — {download.releaseName}. ZIP-архив с
              модами и картой доступен в Google Drive и на резервном зеркале
              Яндекс Диска.
            </p>
            <div className={s.actions}>
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
            </div>
            <p className={s.downloadNote}>{download.note}</p>
          </div>
          <div className={s.installation}>
            <h3>Как установить</h3>
            <ol>
              {installation.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className={s.installationNote}>
              Стандартная папка игры — .minecraft. Если используете отдельный
              профиль, выбирайте его папку.
            </p>
          </div>
        </div>
      </section>

      <section className={`${c.section} ${s.section}`}>
        <div className={s.community}>
          <div>
            <p className={s.kicker}>Связь с разработчиками</p>
            <h2>Не пропустите следующую охоту.</h2>
            <p>Новости Maniac и других проектов — в канале NecroDwarf.</p>
          </div>
          <ContentLink href={contacts[0].url}>
            Telegram команды <span aria-hidden="true">↗</span>
          </ContentLink>
        </div>
      </section>
    </div>
  );
}
