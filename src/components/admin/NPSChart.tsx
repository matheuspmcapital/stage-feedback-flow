
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { CodeResponse } from './AdminDashboard';
import { useNPS } from '@/contexts/NPSContext';

interface NPSChartProps {
  responses: CodeResponse[];
}

interface NPSData {
  name: string;
  value: number;
  fill: string;
  label?: string;
}

const NPSChart: React.FC<NPSChartProps> = ({ responses }) => {
  const { getNPSCategory } = useNPS();

  const processResponses = useMemo(() => {
    let promoters = 0;
    let neutrals = 0;
    let detractors = 0;
    let total = 0;

    // Process all responses to count NPS categories
    responses.forEach(response => {
      const recommendScoreAnswer = response.answers?.find(a => a.question_id === 'recommend_score');
      
      if (recommendScoreAnswer) {
        const score = parseInt(recommendScoreAnswer.answer);
        if (!isNaN(score)) {
          const category = getNPSCategory(score);
          
          if (category === 'promoter') promoters++;
          else if (category === 'neutral') neutrals++;
          else if (category === 'detractor') detractors++;
          
          total++;
        }
      }
    });

    // Calculate NPS score
    const npsScore = total > 0 
      ? Math.round((promoters - detractors) / total * 100) 
      : 0;

    // Prepare data for the chart
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
  }, [responses, getNPSCategory]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>NPS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {processResponses.npsScore}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {processResponses.total} responses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Response Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <div>
                <div className="text-lg font-semibold text-green-500">{processResponses.promoters}</div>
                <div>Promoters</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-amber-500">{processResponses.neutrals}</div>
                <div>Neutrals</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-500">{processResponses.detractors}</div>
                <div>Detractors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processResponses.chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis unit="%" />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Percentage']}
            />
            <Legend />
            <Bar dataKey="value" name="Percentage">
              {processResponses.chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NPSChart;
