
import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NPSChartProps {
  data: {
    name: string;
    recommendScore: number;
    rehireScore: number;
  }[];
}

const NPSChart: React.FC<NPSChartProps> = ({ data }) => {
  // Calculate overall NPS
  const calculateNPS = (scores: number[]) => {
    if (scores.length === 0) return 0;
    
    const promoters = scores.filter(score => score >= 9).length;
    const detractors = scores.filter(score => score <= 6).length;
    
    return Math.round((promoters - detractors) / scores.length * 100);
  };
  
  const recommendScores = data.map(item => item.recommendScore).filter(Boolean) as number[];
  const rehireScores = data.map(item => item.rehireScore).filter(Boolean) as number[];
  
  const overallNPS = calculateNPS(recommendScores);
  const rehireNPS = calculateNPS(rehireScores);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{overallNPS}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rehire NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-secondary">{rehireNPS}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>NPS Scores by Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="recommendScore" name="Recommend Score" fill="hsl(var(--primary))" />
                <Bar dataKey="rehireScore" name="Rehire Score" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NPSChart;
