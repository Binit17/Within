import { motion } from "framer-motion";
import { BurnoutGauge } from "@/components/saathi/BurnoutGauge";
import { MoodTrendChart } from "@/components/saathi/MoodTrendChart";
import { HRVChart } from "@/components/saathi/HRVChart";
import { CBTBreakdown } from "@/components/saathi/CBTBreakdown";
import { EmotionDistribution } from "@/components/saathi/EmotionDistribution";
import { StatsGrid } from "@/components/saathi/StatsGrid";
import { BarChart3 } from "lucide-react";

const InsightsPage = () => {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="dhaka-stripe" />
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Weekly Insights</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">March 23 – March 29, 2026</p>
      </div>

      <div className="px-5 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <BurnoutGauge score={73} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsGrid />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MoodTrendChart />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <HRVChart />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <CBTBreakdown />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <EmotionDistribution />
        </motion.div>
      </div>
    </div>
  );
};

export default InsightsPage;
