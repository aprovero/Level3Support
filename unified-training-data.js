const trainingData = {
  "pt1": {
      "system": "pv",
      "category": "Power Titan I (PT1)",
      "subject": "Central Inverter Training",
      "levels": ["L1", "L2", "L3"],
      "topics": [
          {
              "title": "General Inspections and Basic Operations",
              "details": "Safety training, PV system introduction, component location, operations procedures",
              "level": "L1",
              "duration": "1 full day"
          },
          {
              "title": "Component Replacements and System Operations",
              "details": "Maintenance procedures, IGBT module fault identification, HMI interface operations, remote access",
              "level": "L2",
              "duration": "1 full day"
          },
          {
              "title": "Commissioning and Advanced Operations",
              "details": "Pre-commissioning checklist, commissioning procedures, advanced inverter knowledge, transformer operations",
              "level": "L3",
              "duration": "1 full day"
          }
      ]
  },
  "pt2": {
      "system": "pv",
      "category": "Power Titan II (PT2)",
      "subject": "Central Inverter Training",
      "levels": ["L1", "L2", "L3"],
      "topics": [
          {
              "title": "General Inspections and Basic Operations",
              "details": "Safety training, PV system introduction, component location, operations procedures",
              "level": "L1",
              "duration": "1 full day"
          },
          {
              "title": "Component Replacements and System Operations",
              "details": "Maintenance procedures, IGBT module fault identification, HMI interface operations, remote access",
              "level": "L2",
              "duration": "1 full day"
          },
          {
              "title": "Commissioning and Advanced Operations",
              "details": "Pre-commissioning checklist, commissioning procedures, advanced inverter knowledge, transformer operations",
              "level": "L3",
              "duration": "1 full day"
          }
      ]
  },
  "sg4400": {
      "system": "pv",
      "category": "1+X Inverter (SG4400)",
      "subject": "Central Inverter Training",
      "levels": ["L1", "L2", "L3"],
      "topics": [
          {
              "title": "General Inspections and Basic Operations",
              "details": "Safety training, PV system introduction, component location, operations procedures",
              "level": "L1",
              "duration": "1 full day"
          },
          {
              "title": "Component Replacements and System Operations",
              "details": "Maintenance procedures, IGBT module fault identification, HMI interface operations, remote access",
              "level": "L2",
              "duration": "1 full day"
          },
          {
              "title": "Commissioning and Advanced Operations",
              "details": "Pre-commissioning checklist, commissioning procedures, advanced inverter knowledge, transformer operations",
              "level": "L3",
              "duration": "1 full day"
          }
      ]
  },
  "sg3150": {
      "system": "pv",
      "category": "SG3125 v20 (SG3150)",
      "subject": "Central Inverter Training",
      "levels": ["L1", "L2", "L3"],
      "topics": [
          {
              "title": "General Inspections and Basic Operations",
              "details": "Safety training, PV system introduction, component location, operations procedures",
              "level": "L1",
              "duration": "1 full day"
          },
          {
              "title": "Component Replacements and System Operations",
              "details": "Maintenance procedures, IGBT module fault identification, HMI interface operations, remote access",
              "level": "L2",
              "duration": "1 full day"
          },
          {
              "title": "Commissioning and Advanced Operations",
              "details": "Pre-commissioning checklist, commissioning procedures, advanced inverter knowledge, transformer operations",
              "level": "L3",
              "duration": "1 full day"
          }
      ]
  },
  "sg3600": {
      "system": "pv",
      "category": "SG3125 v30 (SG3600)",
      "subject": "Central Inverter Training",
      "levels": ["L1", "L2", "L3"],
      "topics": [
          {
              "title": "General Inspections and Basic Operations",
              "details": "Safety training, PV system introduction, component location, operations procedures",
              "level": "L1",
              "duration": "1 full day"
          },
          {
              "title": "Component Replacements and System Operations",
              "details": "Maintenance procedures, IGBT module fault identification, HMI interface operations, remote access",
              "level": "L2",
              "duration": "1 full day"
          },
          {
              "title": "Commissioning and Advanced Operations",
              "details": "Pre-commissioning checklist, commissioning procedures, advanced inverter knowledge, transformer operations",
              "level": "L3",
              "duration": "1 full day"
          }
      ]
  },
  "padmount": {
      "system": "pv",
      "category": "Pad-mounted Transformer",
      "subject": "Transformer Training",
      "levels": ["L1", "L2"],
      "topics": [
          {
              "title": "Theoretical and Safety Training",
              "details": "Electrical hazards, PPE, LOTO, transformer basic knowledge, troubleshooting common faults",
              "level": "L1",
              "duration": "1 full day"
          },
          {
              "title": "Manual Operation Procedures",
              "details": "HV/LV bushing replacement, fuse replacement, oil gauge adjustment, load switch replacement",
              "level": "L2",
              "duration": "1 full day"
          }
      ]
  },
  "liquidcooling": {
      "system": "bess",
      "category": "Liquid Cooling BESS",
      "subject": "Battery Energy Storage System",
      "levels": ["L1", "L2", "L3"],
      "topics": [
          {
              "title": "System Introduction and Operations",
              "details": "System composition, transportation, installation, safety training",
              "level": "L1",
              "duration": "1 full day"
          },
          {
              "title": "Software and Common Operations",
              "details": "Software operation, LOTO procedures, cleaning and checking procedures",
              "level": "L2",
              "duration": "1 full day"
          },
          {
              "title": "Advanced O&M Procedures",
              "details": "Component replacements, cell temperature inspection, troubleshooting, PCS operations",
              "level": "L3",
              "duration": "1 full day"
          }
      ]
  },
  "aircooling": {
      "system": "bess",
      "category": "Air Cooling BESS",
      "subject": "Battery Energy Storage System",
      "levels": ["L1", "L2"],
      "topics": [
          {
              "title": "System Introduction and Operations",
              "details": "System composition, software operation, LCD touchscreen operations",
              "level": "L1",
              "duration": "~2 hours"
          },
          {
              "title": "Software and Common Operations",
              "details": "Interface parameters, operations, cleaning and checking procedures",
              "level": "L2",
              "duration": "1 full day"
          }
      ]
  },
  "airforced": {
      "system": "bess",
      "category": "Air Forced Cooling BESS",
      "subject": "Battery Energy Storage System",
      "levels": ["L1", "L2"],
      "topics": [
          {
              "title": "System Introduction and Operations",
              "details": "System composition, transportation, installation, safety training",
              "level": "L1",
              "duration": "1 full day"
          },
          {
              "title": "Software and Common Operations",
              "details": "Interface parameters, operations, cleaning and checking procedures",
              "level": "L2",
              "duration": "1 full day"
          }
      ]
  }
};