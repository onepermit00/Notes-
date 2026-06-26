import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const Timeline = ({ data }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={containerRef} className="relative py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#111B21] mb-6">
            How ADLTrack Works
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See the difference between traditional care and evidence-based monitoring
          </p>
        </motion.div>

        {/* Timeline Items */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#25D366] via-[#0B57D0] to-[#684fa3] hidden lg:block" />

          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative mb-24 last:mb-0"
            >
              {/* Timeline Dot */}
              <div className="hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-[#25D366] shadow-lg z-10" />

              {/* Content Card */}
              <div className={`lg:w-[45%] ${index % 2 === 0 ? 'lg:ml-auto lg:pl-12' : 'lg:mr-auto lg:pr-12'}`}>
                <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow duration-300">
                  {/* Title with Step Number */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white font-bold text-lg">
                      {index + 1}
                    </span>
                    <h3 className="text-2xl font-bold text-[#111B21]">
                      {item.title}
                    </h3>
                  </div>
                  
                  {/* Content */}
                  <div className="text-slate-600">
                    {item.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
