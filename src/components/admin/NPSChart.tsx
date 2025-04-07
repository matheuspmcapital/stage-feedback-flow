
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { CodeResponse } from './AdminDashboard';
import { useNPS } from '@/contexts/NPSContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NPSChartProps {
  responses: CodeResponse[];
}

interface NPSData {
  name: string;
  value: number;
  fill: string;
  label?: string;
}

const CustomTooltip = (props: any) => {
  if (!props.active || !props.payload || props.payload.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white p-2 border rounded shadow">
      <p className="font-medium">{props.payload[0].name}</p>
      <p className="text-sm">{`${props.payload[0].value}%`}</p>
    </div>
  );
};

const NPSChart: React.FC<NPSChartProps> = ({ responses }) => {
  const { getNPSCategory } = useNPS();
  const [filter, setFilter] = useState<string>("all");
  const [metric, setMetric] = useState<string>("recommend_score");

  const serviceTypes = useMemo(() => {
    const types = new Set<string>();
    responses.forEach(response => {
      if (response.service_type) {
        types.add(response.service_type);
      }
    });
    return Array.from(types);
  }, [responses]);

  const processResponses = useMemo(() => {
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
  }, [responses, getNPSCategory, filter, metric]);

  const compareData = useMemo(() => {
    if (serviceTypes.length <= 1) return null;

    const typeData: { [key: string]: { nps: number, responses: number } } = {};
    
    serviceTypes.forEach(type => {
      const typeResponses = responses.filter(r => r.service_type === type);
      let promoters = 0;
      let detractors = 0;
      let total = 0;

      typeResponses.forEach(response => {
        const metricAnswer = response.answers?.find(a => a.question_id === metric);
        
        if (metricAnswer) {
          const score = parseInt(metricAnswer.answer);
          if (!isNaN(score)) {
            const category = getNPSCategory(score);
            
            if (category === 'promoter') promoters++;
            else if (category === 'detractor') detractors++;
            
            total++;
          }
        }
      });

      const npsScore = total > 0 
        ? Math.round((promoters - detractors) / total * 100) 
        : 0;

      typeData[type] = { 
        nps: npsScore,
        responses: total 
      };
    });

    return typeData;
  }, [responses, serviceTypes, getNPSCategory, metric]);

  const getMetricTitle = () => {
    return metric === 'recommend_score' 
      ? 'Recommendation NPS' 
      : 'Rehire NPS';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <h3 className="text-lg font-medium">{getMetricTitle()}</h3>
        <div className="flex items-center gap-2">
          <Tabs 
            value={metric} 
            onValueChange={setMetric} 
            className="w-[240px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommend_score">Recommendation</TabsTrigger>
              <TabsTrigger value="rehire_score">Rehire</TabsTrigger>
            </TabsList>
          </Tabs>
          
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

      <div className="h-[250px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processResponses.chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" name="Percentage">
              {processResponses.chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {compareData && serviceTypes.length > 1 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Service Type Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(compareData).map(([type, data]) => (
                <div key={type} className="p-4 border rounded-lg">
                  <h3 className="font-medium text-lg capitalize mb-2">{type}</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">NPS Score</p>
                      <p className="text-2xl font-bold">{data.nps}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Responses</p>
                      <p className="text-xl">{data.responses}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      data.nps >= 50 ? 'bg-green-100 text-green-700' :
                      data.nps >= 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <span className="font-bold">{data.nps}</span>
                    </div>
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
