/*
 * TEMPORARY MOUNT POINT: Audio lab, removed/gated in spec 6.
 * This is the ONLY file that may import src/audio-lab. Nothing else depends on the lab.
 */
import { AudioLab } from '../audio-lab/AudioLab';

type Props = { onBack: () => void };

export function AudioLabMount({ onBack }: Props) {
  return <AudioLab onBack={onBack} />;
}
