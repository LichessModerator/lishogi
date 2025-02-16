import { h } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';
import { ops as treeOps } from 'tree';
import { TagArray } from './interfaces';
import renderClocks from '../clocks';
import AnalyseCtrl from '../ctrl';
import { isFinished, findTag, resultOf } from './studyChapters';
import { defined } from 'common';

interface PlayerNames {
  sente: string;
  gote: string;
}

export default function (ctrl: AnalyseCtrl): VNode[] | undefined {
  const study = ctrl.study;
  if (!study || ctrl.embed) return;
  const tags = study.data.chapter.tags,
    playerNames = {
      sente: findTag(tags, 'sente')!,
      gote: findTag(tags, 'gote')!,
    };
  if (!playerNames.sente && !playerNames.gote && !treeOps.findInMainline(ctrl.tree.root, n => defined(n.clock))) return;
  const clocks = renderClocks(ctrl),
    ticking = !isFinished(study.data.chapter) && ctrl.turnColor();
  return (['sente', 'gote'] as Color[]).map(color =>
    renderPlayer(tags, clocks, playerNames, color, ticking === color, ctrl.bottomColor() !== color)
  );
}

function renderPlayer(
  tags: TagArray[],
  clocks: [VNode, VNode] | undefined,
  playerNames: PlayerNames,
  color: Color,
  ticking: boolean,
  top: boolean
): VNode {
  const title = findTag(tags, `${color}title`),
    elo = findTag(tags, `${color}elo`),
    result = resultOf(tags, color === 'sente');
  return h(
    `div.study__player.study__player-${top ? 'top' : 'bot'}`,
    {
      class: { ticking },
    },
    [
      h('div.left', [
        result && h('span.result', result),
        h('span.info', [
          title && h('span.title', title + ' '),
          h('span.name', playerNames[color]),
          elo && h('span.elo', elo),
        ]),
      ]),
      clocks && clocks[color === 'sente' ? 0 : 1],
    ]
  );
}
