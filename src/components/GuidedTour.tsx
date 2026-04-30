import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const GuidedTour: React.FC = () => {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    
    if (!hasSeenTour) {
      const driverObj = driver({
        showProgress: true,
        steps: [
          { 
            element: '#dashboard-header', 
            popover: { 
              title: 'Welcome to UDL Sales Dashboard', 
              description: 'This header contains your main navigation and global filters. You can toggle dark mode and login to sync data.', 
              side: "bottom", 
              align: 'start' 
            } 
          },
          { 
            element: '#filter-controls', 
            popover: { 
              title: 'Global Filters', 
              description: 'Filter calculations by Plant, Segment, Customer, and Date Range. All KPIs and charts update instantly.', 
              side: "bottom", 
              align: 'start' 
            } 
          },
          { 
            element: '#upload-banner', 
            popover: { 
              title: 'Import Your Data', 
              description: 'Drag and drop your SAP/ERP Excel or CSV files here. The system validates and maps your data automatically.', 
              side: "bottom", 
              align: 'center' 
            } 
          },
          { 
            element: '#kpi-section', 
            popover: { 
              title: 'Core Business KPIs', 
              description: 'Quickly monitor Total Sales, OTIF % (On-Time In-Full), and Customer Reach across INFA and INFB units.', 
              side: "top", 
              align: 'center' 
            } 
          },
          { 
            element: '#charts-section', 
            popover: { 
              title: 'Visual Analytics', 
              description: 'Explore trends and distributions. Click on chart elements (like bars or slices) to deeply drill down into specific segments or plants.', 
              side: "top", 
              align: 'center' 
            } 
          },
          { 
            element: '#ai-insights', 
            popover: { 
              title: 'AI Decision Layer', 
              description: 'Run deep-learning analysis to find growth opportunities and risk clusters automagically using Gemini 1.5.', 
              side: "top", 
              align: 'center' 
            } 
          },
          { 
            element: '#gemini-chat-toggle', 
            popover: { 
              title: 'Natural Language Query', 
              description: 'Ask questions like "Who are my top 5 customers in Nashik?" or "Analyze last week\'s OTIF drop" to get instant answers.', 
              side: "left", 
              align: 'center' 
            } 
          },
          { 
            element: '#data-table', 
            popover: { 
              title: 'Detailed Sales Record', 
              description: 'A comprehensive table showing every customer with precise Sales and OTIF metrics. Click headers to sort.', 
              side: "top", 
              align: 'center' 
            } 
          }
        ],
        onDestroyStarted: () => {
           localStorage.setItem('hasSeenTour', 'true');
           driverObj.destroy();
        }
      });

      driverObj.drive();
    }
  }, []);

  return null;
};

export default GuidedTour;
