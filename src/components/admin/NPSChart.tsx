
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { CodeResponse } from './AdminDashboard';
import { useNPS } from '@/contexts/NPSContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NPSChartProps {
  responses: CodeResponse[];
}

interface NPSData {
  name: string;
  value: number;
  fill: string;
  label?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white p-2 border rounded shadow">
      <p className="font-medium">{payload[0].name}</p>
      <p className="text-sm">{`${payload[0].value}%`}</p>
    </div>
  );
};

const NPSChart: React.FC<NPSChartProps> = ({ responses }) => {
  const { getNPSCategory } = useNPS();
  const [filter, setFilter] = useState<string>("all");

  const serviceTypes = useMemo(() => {
    const types = new Set<string>();
    responses.forEach(response => {
      if (response.service_type) {
        types.add(response.service_type);
      }
    });
    return Array.from(types);
  }, [responses]);

  const processResponses = (metric: string) => {
    const filteredResponses = filter === "all" 
      ? responses 
      : responses.filter(r => r.service_type === filter);

    let promoters = 0;
    let neutrals = 0;
    let detractors = 0;
    let total = 0;

    filteredResponses.forEach(response => {
      const metricAnswer = response.answers?.find(a => a.question_id === metric);
      
      if (metricAnswer) {
        const score = parseInt(metricAnswer.answer);
        if (!isNaN(score)) {
          const category = getNPSCategory(score);
          
          if (category === 'promoter') promoters++;
          else if (category === 'neutral') neutrals++;
          else if (category === 'detractor') detractors++;
          
          total++;
        }
      }
    });

    const npsScore = total > 0 
      ? Math.round((promoters - detractors) / total * 100) 
      : 0;

    const chartData: NPSData[] = [
      { 
        name: 'Promoters (9-10)', 
        value: total > 0 ? Math.round((promoters / total) * 100) : 0, 
        fill: '#10b981',
        label: 'Promoters'
      },
      { 
        name: 'Neutral (7-8)', 
        value: total > 0 ? Math.round((neutrals / total) * 100) : 0, 
        fill: '#f59e0b',
        label: 'Neutrals'
      },
      { 
        name: 'Detractors (0-6)', 
        value: total > 0 ? Math.round((detractors / total) * 100) : 0, 
        fill: '#ef4444',
        label: 'Detractors'
      }
    ];

    return {
      chartData,
      npsScore,
      total,
      promoters,
      neutrals,
      detractors
    };
  };

  const recommendData = processResponses('recommend_score');
  const rehireData = processResponses('rehire_score');

  const compareData = useMemo(() => {
    if (serviceTypes.length <= 1) return null;

    const typeData: { [key: string]: { recommendNps: number, rehireNps: number, responses: number } } = {};
    
    serviceTypes.forEach(type => {
      const typeResponses = responses.filter(r => r.service_type === type);
      let recommendPromoters = 0;
      let recommendDetractors = 0;
      let rehirePromoters = 0;
      let rehireDetractors = 0;
      let total = 0;

      typeResponses.forEach(response => {
        const recommendAnswer = response.answers?.find(a => a.question_id === 'recommend_score');
        const rehireAnswer = response.answers?.find(a => a.question_id === 'rehire_score');
        
        if (recommendAnswer) {
          const score = parseInt(recommendAnswer.answer);
          if (!isNaN(score)) {
            const category = getNPSCategory(score);
            
            if (category === 'promoter') recommendPromoters++;
            else if (category === 'detractor') recommendDetractors++;
          }
        }
        
        if (rehireAnswer) {
          const score = parseInt(rehireAnswer.answer);
          if (!isNaN(score)) {
            const category = getNPSCategory(score);
            
            if (category === 'promoter') rehirePromoters++;
            else if (category === 'detractor') rehireDetractors++;
          }
        }
        
        total++;
      });

      const recommendNpsScore = total > 0 
        ? Math.round((recommendPromoters - recommendDetractors) / total * 100) 
        : 0;
        
      const rehireNpsScore = total > 0 
        ? Math.round((rehirePromoters - rehireDetractors) / total * 100) 
        : 0;

      typeData[type] = { 
        recommendNps: recommendNpsScore,
        rehireNps: rehireNpsScore,
        responses: total 
      };
    });

    return typeData;
  }, [responses, serviceTypes, getNPSCategory]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <h3 className="text-lg font-medium">NPS Analysis</h3>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Responses</SelectItem>
              {serviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommendation NPS */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200 dark:border-blue-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800 dark:text-blue-300">Recommendation NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {recommendData.npsScore}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {recommendData.total} responses
                </p>
              </div>
              <div className="flex justify-between text-sm">
                <div className="mx-2">
                  <div className="text-lg font-semibold text-green-500">{recommendData.promoters}</div>
                  <div>Promoters</div>
                </div>
                <div className="mx-2">
                  <div className="text-lg font-semibold text-amber-500">{recommendData.neutrals}</div>
                  <div>Neutrals</div>
                </div>
                <div className="mx-2">
                  <div className="text-lg font-semibold text-red-500">{recommendData.detractors}</div>
                  <div>Detractors</div>
                </div>
              </div>
            </div>
            
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={recommendData.chartData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Percentage">
                    {recommendData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rehire NPS */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 border-purple-200 dark:border-purple-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-800 dark:text-purple-300">Rehire NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {rehireData.npsScore}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {rehireData.total} responses
                </p>
              </div>
              <div className="flex justify-between text-sm">
                <div className="mx-2">
                  <div className="text-lg font-semibold text-green-500">{rehireData.promoters}</div>
                  <div>Promoters</div>
                </div>
                <div className="mx-2">
                  <div className="text-lg font-semibold text-amber-500">{rehireData.neutrals}</div>
                  <div>Neutrals</div>
                </div>
                <div className="mx-2">
                  <div className="text-lg font-semibold text-red-500">{rehireData.detractors}</div>
                  <div>Detractors</div>
                </div>
              </div>
            </div>
            
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rehireData.chartData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Percentage">
                    {rehireData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {compareData && serviceTypes.length > 1 && (
        <Card className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/30 border-gray-200 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Service Type Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(compareData).map(([type, data]) => (
                <div key={type} className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  <h3 className="font-medium text-lg capitalize mb-2">{type}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Recommend</p>
                        <p className="text-xl font-bold">{data.recommendNps}</p>
                      </div>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        data.recommendNps >= 50 ? 'bg-green-100 text-green-700' :
                        data.recommendNps >= 0 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <span className="font-bold">{data.recommendNps}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Rehire</p>
                        <p className="text-xl font-bold">{data.rehireNps}</p>
                      </div>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        data.rehireNps >= 50 ? 'bg-green-100 text-green-700' :
                        data.rehireNps >= 0 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <span className="font-bold">{data.rehireNps}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Responses</p>
                    <p className="text-lg">{data.responses}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NPSChart;
