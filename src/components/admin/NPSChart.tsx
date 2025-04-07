
import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

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

  // Prepare data for pie charts
  const getPieData = (scores: number[]) => {
    const promoters = scores.filter(score => score >= 9).length;
    const passives = scores.filter(score => score > 6 && score < 9).length;
    const detractors = scores.filter(score => score <= 6).length;
    
    return [
      { name: 'Promoters', value: promoters },
      { name: 'Passives', value: passives },
      { name: 'Detractors', value: detractors },
    ].filter(segment => segment.value > 0);
  };
  
  const recommendPieData = getPieData(recommendScores);
  const rehirePieData = getPieData(rehireScores);
  
  const COLORS = ['#4ade80', '#facc15', '#f87171'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-medium mb-2">Recommendation Score Breakdown</h3>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-3xl font-bold">{overallNPS}</span>
            <span className="text-sm text-muted-foreground">NPS Score</span>
          </div>
          <div className="h-64">
            {recommendPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recommendPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {recommendPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-base font-medium mb-2">Rehire Score Breakdown</h3>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-3xl font-bold">{rehireNPS}</span>
            <span className="text-sm text-muted-foreground">NPS Score</span>
          </div>
          <div className="h-64">
            {rehirePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rehirePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {rehirePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-base font-medium mb-2">Scores by Client</h3>
        <div className="h-80">
          {data.length > 0 ? (
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
                <Legend />
                <Bar dataKey="recommendScore" name="Recommend Score" fill="#3b82f6" />
                <Bar dataKey="rehireScore" name="Rehire Score" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NPSChart;
