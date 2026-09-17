# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The PRD is `.scratch/<feature-slug>/PRD.md`
- Implementation issues are `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Each issue links to its PRD on a `PRD:` line right under `Status:`
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Перенос вёлся без файлов задач

`.scratch/` — не полный список сделанного. Перенос device на Astro шёл одной
сессией и оставил после себя PRD и шесть разборов, но папки задач под каждую
секцию не заводились: они были бы записаны задним числом.

PRD в этом проекте — запись разговора, то есть какие варианты рассматривались и
чем оплачен выбор. Сочинить её после факта значит выдать за состоявшийся разговор
то, чего не было.

Из этого следует практическое: **на вопрос «почему сделано именно так» отвечает
`docs/adr/`, а не `.scratch/`.** Каталог задач полон только с той стороны, что
каждая папка соответствует настоящей работе, — но не наоборот.
