
import React, { useState } from "react";
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
  Legend,
  LineChart,
  Line
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NPSChartProps {
  data: {
    userName: string;
    recommendScore: number;
    rehireScore: number;
    serviceType: string;
  }[];
  strategyData: {
    userName: string;
    recommendScore: number;
    rehireScore: number;
  }[];
  experienceData: {
    userName: string;
    recommendScore: number;
    rehireScore: number;
  }[];
}

const NPSChart: React.FC<NPSChartProps> = ({ data, strategyData, experienceData }) => {
  const [activeTab, setActiveTab] = useState("overall");
  
  // Calculate overall NPS
  const calculateNPS = (scores: number[]) => {
    if (scores.length === 0) return 0;
    
    const promoters = scores.filter(score => score >= 9).length;
    const detractors = scores.filter(score => score <= 6).length;
    
    return Math.round((promoters - detractors) / scores.length * 100);
  };
  
  // Extract scores for calculations
  const recommendScores = data.map(item => item.recommendScore).filter(Boolean) as number[];
  const rehireScores = data.map(item => item.rehireScore).filter(Boolean) as number[];
  
  const strategyRecommendScores = strategyData.map(item => item.recommendScore).filter(Boolean) as number[];
  const strategyRehireScores = strategyData.map(item => item.rehireScore).filter(Boolean) as number[];
  
  const experienceRecommendScores = experienceData.map(item => item.recommendScore).filter(Boolean) as number[];
  const experienceRehireScores = experienceData.map(item => item.rehireScore).filter(Boolean) as number[];
  
  // Calculate NPS scores
  const overallNPS = calculateNPS(recommendScores);
  const overallRehireNPS = calculateNPS(rehireScores);
  
  const strategyNPS = calculateNPS(strategyRecommendScores);
  const strategyRehireNPS = calculateNPS(strategyRehireScores);
  
  const experienceNPS = calculateNPS(experienceRecommendScores);
  const experienceRehireNPS = calculateNPS(experienceRehireScores);

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
  
  // Prepare data for comparison charts
  const comparisonData = [
    { name: 'Strategy', recommend: strategyNPS, rehire: strategyRehireNPS },
    { name: 'Experience', recommend: experienceNPS, rehire: experienceRehireNPS },
    { name: 'Overall', recommend: overallNPS, rehire: overallRehireNPS }
  ];
  
  // Get pie data for each category
  const recommendPieData = getPieData(recommendScores);
  const rehirePieData = getPieData(rehireScores);
  
  const strategyRecommendPieData = getPieData(strategyRecommendScores);
  const strategyRehirePieData = getPieData(strategyRehireScores);
  
  const experienceRecommendPieData = getPieData(experienceRecommendScores);
  const experienceRehirePieData = getPieData(experienceRehireScores);
  
  const COLORS = ['#4ade80', '#facc15', '#f87171'];

  // Render pie charts for a specific dataset
  const renderPieCharts = (
    recommendPieData: { name: string; value: number }[],
    rehirePieData: { name: string; value: number }[],
    npsScore: number,
    rehireNpsScore: number
  ) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-medium mb-2">Recommendation Score</h3>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-3xl font-bold">{npsScore}</span>
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
          <h3 className="text-base font-medium mb-2">Rehire Score</h3>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-3xl font-bold">{rehireNpsScore}</span>
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
    </div>
  );
  
  const renderComparisonCharts = () => (
    <div className="space-y-6">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={comparisonData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[-100, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="recommend" name="Recommend NPS" fill="#3b82f6" />
            <Bar dataKey="rehire" name="Rehire NPS" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={comparisonData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[-100, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="recommend" name="Recommend NPS" stroke="#3b82f6" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="rehire" name="Rehire NPS" stroke="#8b5cf6" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
  
  return (
    <div>
      <Tabs 
        defaultValue="overall" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overall" className="mt-4">
          {renderPieCharts(recommendPieData, rehirePieData, overallNPS, overallRehireNPS)}
        </TabsContent>
        
        <TabsContent value="strategy" className="mt-4">
          {renderPieCharts(strategyRecommendPieData, strategyRehirePieData, strategyNPS, strategyRehireNPS)}
        </TabsContent>
        
        <TabsContent value="experience" className="mt-4">
          {renderPieCharts(experienceRecommendPieData, experienceRehirePieData, experienceNPS, experienceRehireNPS)}
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-4">
          {renderComparisonCharts()}
        </TabsContent>
      </Tabs>
      
      {activeTab !== 'comparison' && (
        <div className="mt-8">
          <h3 className="text-base font-medium mb-2">Scores by Client</h3>
          <div className="h-80">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeTab === 'strategy' ? strategyData : 
                         activeTab === 'experience' ? experienceData : data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="userName" 
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
      )}
    </div>
  );
};

export default NPSChart;
