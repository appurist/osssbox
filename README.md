# osssbox
## OSSSBox - The Online Simple Storage Server (for S3)

[![Netlify Status](https://api.netlify.com/api/v1/badges/f840c0c4-fcbe-4f0e-9115-73ca83a3d955/deploy-status)](https://app.netlify.com/sites/osssbox/deploys)

The goal of this project is to deliver **a *generic* server back-end** that can be used for many software development projects. It provides a package of **serverless** functions that can be easily and quickly provisioned to
[Netlify](https://netlify.com/) (as [Netlify Functions](https://docs.netlify.com/functions/overview/)), or to
[Amazon AWS](https://aws.amazon.com/) (with [AWS Lambda](https://aws.amazon.com/lambda/)).

This package of serverless functions provides an authenticated, multi-user REST API interface to high-level generic **project** and **asset** definitions, with back-end storage on:
- [Amazon's Simple Storage Service](https://aws.amazon.com/s3/)  (S3), or
- [Vultr's "Object Storage"](https://www.vultr.com/docs/vultr-object-storage) (which is S3-compatible object storage).

**NOTE: This is a work in progress.**
