import { ReactNode } from 'react';
import { GooeyText } from './ui/gooey-text-morphing';

import bg1 from "../assets/1.png";
import bg2 from "../assets/2.png";
import bg3 from "../assets/3.png";
import bg4 from "../assets/4.png";
import bg5 from "../assets/5.png";

interface StageSplitScreenProps {
  children: ReactNode
}

const backgrounds = [bg1, bg2, bg3, bg4, bg5];

export default function StageSplitScreen({ children }: StageSplitScreenProps) {
  const getBackgroundForToday = () => {
    const day = new Date().getDate();
    const index = (day - 1) % backgrounds.length;
    return backgrounds[index];
  };

  const backgroundImage = getBackgroundForToday();

  return (
    <div className="flex">
      <div className="flex-1 bg-[#21005E] flex items-center justify-center bg-cover" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <GooeyText
          texts={["Stage", "is", "Strategy", "&", "Business", "Design", "Technology", "Solutions", "M&A", "and", "Finance"]}
          morphTime={1}
          cooldownTime={0.25}
          className="font-bold"
        />
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}