import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Cloud, Thermometer, Droplets, Target, FileDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SectionHeading } from '../components/common/SectionHeading';
import { EmptyState } from '../components/common/EmptyState';
import { PredictionDetailsDialog } from '../components/predictions/PredictionDetailsDialog';
import { formatCurrency, formatNumber } from '../lib/utils';
import { downloadPredictionPdf } from '../lib/pdf';
import { useCreatePrediction, useWeather } from '../hooks/useCropwiseQueries';
import { getApiErrorMessage } from '../lib/api';

const initialForm = {
  state: '',
  district: '',
  season: 'Kharif',
  rainfall: '',
  area: '',
  soil_ph: 6.5,
  nitrogen: '',
  phosphorus: '',
  potassium: ''
};

export function PredictPage() {
  const [form, setForm] = useState(initialForm);
  const [weatherRequested, setWeatherRequested] = useState(false);
  const [localError, setLocalError] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const weatherQuery = useWeather(form.state, form.district, weatherRequested);
  const createPredictionMutation = useCreatePrediction();

  useEffect(() => {
    if (weatherRequested && weatherQuery.data?.success && weatherQuery.data.data) {
      const weather = weatherQuery.data.data;
      setForm((current) => ({
        ...current,
        rainfall: weather.rainfall === 0 ? current.rainfall : String(weather.rainfall)
      }));
    }
  }, [weatherRequested, weatherQuery.data]);

  useEffect(() => {
    if (weatherRequested && weatherQuery.isError) {
      setLocalError(getApiErrorMessage(weatherQuery.error));
    }
  }, [weatherRequested, weatherQuery.isError, weatherQuery.error]);

  const weather = weatherQuery.data?.data;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    const required = ['state', 'district', 'season', 'area', 'soil_ph', 'nitrogen', 'phosphorus', 'potassium'];
    for (const field of required) {
      if (form[field] === '' || form[field] === null || form[field] === undefined) {
        return `Please fill ${field.replace('_', ' ')}`;
      }
    }
    return '';
  };

  const handleWeatherAutofill = () => {
    if (!form.state || !form.district) {
      setLocalError('Enter state and district to fetch weather');
      return;
    }
    setLocalError('');
    setWeatherRequested(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validateForm();
    if (error) {
      setLocalError(error);
      return;
    }

    setLocalError('');
    const payload = {
      state: form.state,
      district: form.district,
      season: form.season,
      area: Number(form.area),
      soil_ph: Number(form.soil_ph),
      nitrogen: Number(form.nitrogen),
      phosphorus: Number(form.phosphorus),
      potassium: Number(form.potassium)
    };

    if (form.rainfall !== '') {
      payload.rainfall = Number(form.rainfall);
    }

    try {
      const response = await createPredictionMutation.mutateAsync(payload);
      setPrediction(response.data);
      setDetailsOpen(true);
    } catch (error) {
      setLocalError(getApiErrorMessage(error));
    }
  };

  const summaryCards = useMemo(() => {
    if (!prediction) return [];
    return [
      { label: 'Predicted crop', value: prediction.predicted_crop, icon: <Sprout className="h-5 w-5" /> },
      { label: 'Yield', value: `${formatNumber(prediction.expected_yield)} t/ha`, icon: <Target className="h-5 w-5" /> },
      { label: 'Production', value: `${formatNumber(prediction.expected_production)} tonnes`, icon: <Droplets className="h-5 w-5" /> },
      { label: 'Revenue', value: formatCurrency(prediction.estimated_revenue), icon: <FileDown className="h-5 w-5" /> }
    ];
  }, [prediction]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Field scan"
        title="Predict crop suitability"
        description="Use live weather, soil properties, and farm context to generate an AI-backed recommendation from the backend Gemini service."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="bg-white/90">
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="State" value={form.state} onChange={(event) => updateField('state', event.target.value)} />
                  <Input placeholder="District" value={form.district} onChange={(event) => updateField('district', event.target.value)} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Select value={form.season} onChange={(event) => updateField('season', event.target.value)}>
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                    <option value="Whole Year">Whole Year</option>
                  </Select>
                  <Input type="number" step="0.01" min="0" placeholder="Area (ha)" value={form.area} onChange={(event) => updateField('area', event.target.value)} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input type="number" step="0.1" min="0" placeholder="Rainfall (mm)" value={form.rainfall} onChange={(event) => updateField('rainfall', event.target.value)} />
                  <div className="flex items-center gap-4 rounded-2xl border border-crop-200 bg-crop-50/70 px-4 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.22em] text-crop-700">Soil pH</p>
                      <input className="mt-2 w-full accent-crop-600" type="range" min="0" max="14" step="0.1" value={form.soil_ph} onChange={(event) => updateField('soil_ph', event.target.value)} />
                    </div>
                    <Badge variant="default">{Number(form.soil_ph).toFixed(1)}</Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Input type="number" min="0" placeholder="Nitrogen" value={form.nitrogen} onChange={(event) => updateField('nitrogen', event.target.value)} />
                  <Input type="number" min="0" placeholder="Phosphorus" value={form.phosphorus} onChange={(event) => updateField('phosphorus', event.target.value)} />
                  <Input type="number" min="0" placeholder="Potassium" value={form.potassium} onChange={(event) => updateField('potassium', event.target.value)} />
                </div>

                {localError ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{localError}</p> : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="outline" onClick={handleWeatherAutofill} disabled={weatherQuery.isFetching}>
                    <Cloud className="h-4 w-4" />
                    {weatherQuery.isFetching ? 'Fetching weather' : 'Autofill weather'}
                  </Button>
                  <Button type="submit" disabled={createPredictionMutation.isPending}>
                    <Sprout className="h-4 w-4" />
                    {createPredictionMutation.isPending ? 'Predicting...' : 'Generate prediction'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Card className="h-full bg-crop-gradient text-white">
            <CardContent>
              <p className="text-xs uppercase tracking-[0.28em] text-white/70">Realtime weather</p>
              <h3 className="mt-2 text-2xl font-semibold">Field conditions</h3>
              <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                <WeatherTile icon={<Droplets className="h-5 w-5" />} label="Rainfall" value={weather ? `${formatNumber(weather.rainfall)} mm` : 'Fetch weather'} />
                <WeatherTile icon={<Cloud className="h-5 w-5" />} label="Humidity" value={weather ? `${formatNumber(weather.humidity, 0)}%` : 'Fetch weather'} />
                <WeatherTile icon={<Thermometer className="h-5 w-5" />} label="Temperature" value={weather ? `${formatNumber(weather.temperature, 1)}°C` : 'Fetch weather'} />
              </div>
              <p className="mt-6 text-sm leading-6 text-white/80">
                Real weather is pulled from the backend so the prediction request can reflect the current field context before Gemini generates the recommendation.
              </p>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {prediction ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <Card key={card.label} className="bg-white/90">
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-crop-50 text-crop-700">{card.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {prediction ? (
        <Card>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-crop-700">Prediction result</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">{prediction.predicted_crop}</h3>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={prediction.price_trend === 'up' ? 'success' : prediction.price_trend === 'down' ? 'danger' : 'neutral'}>
                  {prediction.price_trend}
                </Badge>
                <Button variant="outline" onClick={() => downloadPredictionPdf(prediction)}>
                  <FileDown className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoBox label="Confidence" value={`${formatNumber(prediction.confidence, 0)}%`} />
              <InfoBox label="Yield" value={`${formatNumber(prediction.expected_yield)} t/ha`} />
              <InfoBox label="Production" value={`${formatNumber(prediction.expected_production)} tonnes`} />
              <InfoBox label="Market price" value={formatCurrency(prediction.market_price)} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Alternative crops</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {prediction.recommendations?.filter((item) => item !== prediction.soil_tips)?.slice(0, 6).map((item, index) => (
                    <Badge key={index} variant="default">{item}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Soil tips</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{prediction.soil_tips}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setDetailsOpen(true)}>View full report</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<Sprout className="h-6 w-6" />}
          title="No prediction yet"
          description="Fill the form, autofill live weather if needed, and generate a prediction to see crop, yield, and revenue insights."
        />
      )}

      <PredictionDetailsDialog
        prediction={prediction}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onExport={downloadPredictionPdf}
      />
    </div>
  );
}

function WeatherTile({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-3 text-white/80">{icon}<span className="text-sm">{label}</span></div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-3xl border border-crop-100 bg-crop-50/60 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-crop-700">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
