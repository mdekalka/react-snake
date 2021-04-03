import { InformationBoard, InformationSection, InformationTypography } from '../components/common/InformationBoard'

import { BOARD_EFFECTS } from '../constants/boardEffectsConstants';
import { getScoreUntilNextEffect } from '../hooks';

export const GameStatistics = ({ score, snakeSpeed, stats }) => {
  return (
    <InformationBoard>
      <InformationSection>
        <InformationTypography type="header">Statistics:</InformationTypography>
        
        <InformationTypography type="text">Curent score: {score}</InformationTypography>
        <InformationTypography type="text">Current speed: {snakeSpeed}</InformationTypography>
        <hr/>
        <InformationTypography type="text">Hightest score: {stats.highestScore}</InformationTypography>
        <InformationTypography type="text">Hightest speed: {stats.highestSpeed}</InformationTypography>
        <hr/>
        <InformationTypography>You need to get <InformationTypography type="meta" highlight>{getScoreUntilNextEffect(score)}</InformationTypography> points to generate next effect.</InformationTypography>
      </InformationSection>
      
      <InformationSection>
        <InformationTypography type="header">Controls:</InformationTypography>

        <InformationTypography type="text"><InformationTypography type="meta" highlight>↑</InformationTypography> - to move up</InformationTypography>
        <InformationTypography type="text"><InformationTypography type="meta" highlight>→</InformationTypography> - to move right</InformationTypography>
        <InformationTypography type="text"><InformationTypography type="meta" highlight>↓</InformationTypography> - to move down</InformationTypography>
        <InformationTypography type="text"><InformationTypography type="meta" highlight>←</InformationTypography> - to move left</InformationTypography>
      </InformationSection>

      <InformationSection>
        <InformationTypography type="header">Board effects:</InformationTypography>

        {BOARD_EFFECTS.map(({ id, quality, icon, description}) => (
          <InformationTypography key={id} type="text">
            <InformationTypography sign={quality} type="meta">{icon}</InformationTypography>  - {description}
          </InformationTypography>
        ))}
      </InformationSection>
    </InformationBoard>
  )
}

GameStatistics.defaultProps = {
  score: 0,
  snakeSpeed: 0,
  stats: {}
}