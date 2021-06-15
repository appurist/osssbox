# OSSSBox Storage

## General

OSSSBox storage can be divided into two major categories, **auth storage** and **user storage**. *Auth storage* is those files necessary for logins and authentication tokens. *User storage* is further divided into *account-related* info (such as public and private profile info), as well as user *projects*, and *assets*.

Note: Where a key (S3 path) component is enclosed in `(parentheses)`, it represents a variable placeholder for actual information, such as a users login ID or account UUID.

## Summary of  Storage

Here is a quick summary of all available data storage:

`auth/(login).json` 	(login info for 'admin')
`users/(user).json`	("public" user record (profile) for 'admin')
`users/(user)/account.json`	(additional account info for 'admin')
`users/(user)/projects/(project).json`	(a project owned by 'admin')
`users/(user)/assets/(asset).json`		(an asset owned by 'admin')

In this case, `(login)`,  `(project)` and  `(asset)` are all represented by UUIDs.

Here are some examples of the above storage paths (S3 keys):

`auth/admin.json` 	(login info for 'admin')
`users/1fd8cd99-8a56-40d6-9016-54379fee58ae.json`	("public" user record (profile) for 'admin')
`users/1fd8cd99-8a56-40d6-9016-54379fee58ae/account.json`	(additional account info for 'admin')
`users/1fd8cd99-8a56-40d6-9016-54379fee58ae/projects/4abfb278-eb37-44ad-9688-33f23a04cf78.json`	(a project owned by 'admin')
`users/1fd8cd99-8a56-40d6-9016-54379fee58ae/assets/ac452d0d-cb55-4ea6-9290-8309e3ff7ad8.json`

Everything under the UUID-named folder such as `users/1fd8cd99-8a56-40d6-9016-54379fee58ae/` is private to that user. This is why the user's *public* profile itself is *not* under that folder named `profile.json`; other users would not have access. This access is enforced by the OSSSBox server, rather than S3 permissions. A user's profile can be made private or public by placing that file either directly under `/users` with the corresponding numbered JSON file, or to not provide that, and only the regular `account.json` is available under the account folder.

### Auth Storage for Logins

The second storage category, **auth storage**, is system data, and should never be accessible by regular users (although this is also true for all OSSSBox data, since the file storage does not use native accounts (e.g. OSSSBox is designed to access a single S3-compatible project bucket using a single administrative account (e.g. one IAM account providing access to the full S3 storage bucket). OSSSBox regulates access to the per-user storage using OSSSBox user definitions, not S3 accounts.

The **auth storage** area provides the information necessary to process logins by an arbitrary login indicator, typically a *userid*, *email*, account number, phone number, etc. It is *not* ***known*** to be one of these, and can be *any* of these, or even something different. OSSSBox does *not* assume the login ID is your email, or anything specific.

### `auth/(login).json`

Example: `auth/admin.json`

```json
{
  "user": {
    "uid": "eeaf2286-61cb-409d-b0ca-cccb48f71633",
    "login": "admin",
    "display": "Administrator",
    "email": "dev@osssbox.com"
  },
  "credentials": {
    "salt": "$2b$12$PyDmOZbqgAmn5KEBDqg7u.",
    "hash": "$2b$12$PyDmOZbqgAmn5KEBDqg7u.dJnCT4AjkJ9PGPpbnEj/92QByHh1psm"
  }
}
```

This path stores a JSON document for the user account with a `login` (ID) specified in the *basename* of the filename (`'admin'` in the case above). The JSON document includes `user` and `credentials` fields, with the `user` field including `uid`, `login`, and other user information necessary to produce a (JWT) authorization token in the login reply.  The `credentials` field includes `salt` and `hash` members, stored when an account is created. These auth fields allow login authentication by the account. This JSON document is needed to verify a login, but the `uid` field in particular is required to access other files associated with a user account by path. If a login attempt passes fields that match the `credentials`, the `user` field is used to create a JWT token for that user, and it is included as `token` along with the other `user` fields, in the login reply.

### `users/(user).json`
Example: `users/1fd8cd99-8a56-40d6-9016-54379fee58ae.json`
(public user record (profile) for 'admin')

Example:

```json
{
  "uid": "1fd8cd99-8a56-40d6-9016-54379fee58ae",
  "display": "Administrator",
  "avatar": ""
  }
```



### `users/(user)/account.json`
Example: `users/1fd8cd99-8a56-40d6-9016-54379fee58ae/account.json`
(additional account info for 'admin')

```json
{
  "uid": "eeaf2286-61cb-409d-b0ca-cccb48f71633",
  "login": "admin",
  "display": "Administrator",
  "email": "dev@osssbox.com"
}
```



### `users/(user)/projects/(project).json`
Example: `users/1fd8cd99-8a56-40d6-9016-54379fee58ae/projects/4abfb278-eb37-44ad-9688-33f23a04cf78.json`
(a project owned by 'admin')

### `users/(user)/assets/(asset).json`
Example: `users/1fd8cd99-8a56-40d6-9016-54379fee58ae/assets/ac452d0d-cb55-4ea6-9290-8309e3ff7ad8.json`

