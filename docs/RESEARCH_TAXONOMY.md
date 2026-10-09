# Research Taxonomy

Approved 2026-10-09. 18 nodes organized as a core pathway with methodological branches.

## Structure

The roadmap follows the natural progression of a research project from question formulation through publication. Nodes 00-08 form the **core pathway** (sequential). Nodes 09-17 are **methodological branches** that build on the core and lead into specialized analyses and evidence synthesis.

## Core Pathway (Sequential)

| # | Node ID | Title | Prerequisites |
|---|---------|-------|---------------|
| 0 | `00_research_foundations` | Research Foundations & Question Formulation | — |
| 1 | `01_study_design` | Study Design Selection | 00 |
| 2 | `02_protocol_development` | Protocol Development & Preregistration | 01 |
| 3 | `03_literature_search` | Literature Search & Information Retrieval | 02 |
| 4 | `04_reference_management` | Reference Management & Citation Workflows | 03 |
| 5 | `05_systematic_review` | Systematic Review Methodology & Screening | 03, 04 |
| 6 | `06_risk_of_bias` | Risk of Bias & Critical Appraisal | 01, 05 |
| 7 | `07_data_extraction` | Data Extraction & Management | 02, 05 |
| 8 | `08_data_cleaning` | Data Cleaning & Tidy Data Principles | 07 |

## Methodological Branches

These nodes build on the core pathway and branch into specialized analytical methods.

### Statistics & Modelling

| # | Node ID | Title | Prerequisites |
|---|---------|-------|---------------|
| 9 | `09_statistics_foundations` | Statistics Foundations & Power Analysis | 08 |
| 10 | `10_regression_modelling` | Multivariable Regression Modelling & Diagnostics | 08, 09 |
| 11 | `11_survival_analysis` | Survival Analysis & Time-to-Event Data | 10 |
| 12 | `12_diagnostic_accuracy` | Diagnostic Accuracy Studies & ROC Analysis | 09 |
| 13 | `13_clinical_prediction_models` | Clinical Prediction Models, Validation & TRIPOD | 10, 11, 12 |
| 14 | `14_causal_inference` | Causal Inference & Propensity Score Methods | 10, 11 |

### Evidence Synthesis

| # | Node ID | Title | Prerequisites |
|---|---------|-------|---------------|
| 15 | `15_pairwise_meta_analysis` | Pairwise Meta-Analysis & Evidence Synthesis | 09, 10 |
| 16 | `16_network_meta_analysis` | Network Meta-Analysis & Multiple Treatment Comparisons | 15 |
| 17 | `17_advanced_evidence_synthesis` | Advanced Evidence Synthesis, Risk of Bias & GRADE | 15 |

## Visual Layout (Conceptual)

```
[00] → [01] → [02] → [03] → [04] → [05] → [06] → [07] → [08]
                                                              │
                                                    ┌─────────┼─────────┐
                                                    ▼         ▼         ▼
                                                  [09]     [15]      [14]
                                                    │         │
                                                    ▼         ▼
                                                  [10]     [16]
                                                    │         │
                                              ┌─────┼─────┐   ▼
                                              ▼     ▼     ▼  [17]
                                            [11]  [12]  [13]
```

## Resource Distribution

| Node | Resources | Partitions |
|------|-----------|------------|
| 00_research_foundations | 3 | software-guides, videos |
| 01_study_design | 3 | software-guides |
| 02_protocol_development | 4 | software-guides |
| 03_literature_search | 4 | software-guides, code-web, videos |
| 04_reference_management | 3 | software-guides, videos, code-web |
| 05_systematic_review | 5 | software-guides, code-web |
| 06_risk_of_bias | 5 | software-guides, code-web |
| 07_data_extraction | 4 | software-guides, code-web |
| 08_data_cleaning | 4 | code-web, software-guides |
| 09_statistics_foundations | 4 | software-guides, code-web, videos |
| 10_regression_modelling | 5 | software-guides, code-web |
| 11_survival_analysis | 4 | code-web, software-guides |
| 12_diagnostic_accuracy | 4 | software-guides, code-web, videos |
| 13_clinical_prediction_models | 5 | software-guides, code-web |
| 14_causal_inference | 5 | software-guides, code-web |
| 15_pairwise_meta_analysis | 5 | software-guides, code-web |
| 16_network_meta_analysis | 4 | software-guides, code-web |
| 17_advanced_evidence_synthesis | 5 | software-guides, code-web |

**Total: 18 nodes, 61 resources**

## Content Scope

- **Domain**: Both tracks — core research methods + medical/clinical-specific branches
- **Language**: English only
- **Commercial tools**: Included with clear labeling (Covidence, GRADEpro, REDCap, etc.)
- **Free/open-source**: Prioritized (Zotero, R packages, Python libraries)
- **Resources per node**: 3-5, covering videos, code/web, and software/guides partitions
