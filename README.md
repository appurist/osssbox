# osssbox
## OSSSBox - The Online Simple Storage Server (for S3)
[![Netlify Status](https://api.netlify.com/api/v1/badges/f840c0c4-fcbe-4f0e-9115-73ca83a3d955/deploy-status)](https://app.netlify.com/sites/osssbox/deploys)

![Logo](osssbox-logo.png)

The goal of this project is to deliver **a *generic* server back-end** that can be used for many software development projects. When complete, it will provide a package of **serverless** functions that can be easily and quickly provisioned to:
- [Netlify](https://netlify.com/) (as [Netlify Functions](https://docs.netlify.com/functions/overview/)), or to
- [Amazon AWS](https://aws.amazon.com/) (with [AWS Lambda](https://aws.amazon.com/lambda/)).

This package of serverless functions provides an authenticated, multi-user REST API interface to high-level generic **project** and **asset** definitions, with back-end storage on:
- [Amazon's Simple Storage Service](https://aws.amazon.com/s3/)  (S3), or
- [Vultr's "Object Storage"](https://www.vultr.com/docs/vultr-object-storage) (which is S3-compatible object storage).
- [Upcloud's "Object Storage"](https://upcloud.com/products/object-storage/) (which is also S3-compatible object storage).

## NEW PROJECT - OLD PROJECT
This is a new project under active development and changing frequently. Documentation for use is not yet available, but will be following on. This is effectively a redo of the earlier [SOSSBox](https://github.com/appurist/sossbox) project, which was a Node+Fastify REST API server that used local storage for documents and assets. This alternative abandons the Node server entirely for a Serverless architecture using S3-compatible storage for persistence.

However, the basic premise remains, which is that REST API endpoints provide authenticated user-specific CRUD operations on generic "project" documents, which are represented by JSON files, which reference zero or more external "assets", which are stored again as JSON metadata, optionally paired with a binary blob file for larger content such as images.

**NOTE: This is an early work in progress, or more accurately a personal experiment that I will probably make use of once it is complete.**
