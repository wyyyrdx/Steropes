# Steropes
### A Physically-Grounded Model Cascade for Agentic Vision

*Submission for the OpenCV AI Competition 2026, powered by AWS*

> The robot's own motion is treated as a cheap alternative to a costly cloud API call not just a reaction that happens after a decision is made.

---

## Idea

A visual monitoring system that manages its own operating cost in real time. Instead of the usual two-tier cascade (cheap local model → expensive cloud model), it adds a middle tier: when confidence is low, the camera **physically repositions itself** first, and only escalates to a cloud VLM if that still doesn't resolve the ambiguity.

Built for deployments where connectivity is metered and expensive (e.g. remote environmental/wildlife/agricultural monitoring on satellite uplink) movement is nearly free, cloud calls aren't.

## How It Works

```
Frame → [Tier 1] Local detection (OpenCV 5) + confidence score
↓ low confidence
[Tier 2] Reposition camera → re-detect
↓ still low confidence
[Tier 3] Escalate to cloud VLM (Amazon Bedrock)
```

## Stack

- **Vision:** OpenCV 5 (`cv2.dnn`)
- **Edge:** Raspberry Pi 5 / Jetson Orin Nano
- **Agent/decision logic:** AWS Lambda
- **Cloud VLM:** Amazon Bedrock
- **Comms:** AWS IoT Core (MQTT)
- **Storage:** DynamoDB
- **Dashboard:** S3 + CloudFront

## Team

**AI / Computer Vision Engineer - [codewithsami1234]**
**Backend Engineer - [wyyyrdx]**
**Frontend Engineer - [...]**
**Hardware / Robotics Engineer - [basil2ay]**
**AI Agent / AWS Engineer - [macaadaxmed5252-droid]**

## Status

🚧 Work in progress..
