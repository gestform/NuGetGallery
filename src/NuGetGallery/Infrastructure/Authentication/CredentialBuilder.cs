﻿// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

using System;
using System.Linq;
using NuGetGallery.Authentication;
using NuGetGallery.Services.Authentication;

namespace NuGetGallery.Infrastructure.Authentication
{
    public class CredentialBuilder : ICredentialBuilder
    {
        public const string LatestPasswordType = CredentialTypes.Password.V3;

        public Credential CreatePasswordCredential(string plaintextPassword)
        {
            return new Credential(
                LatestPasswordType,
                V3Hasher.GenerateHash(plaintextPassword));
        }

        public Credential CreateApiKey(TimeSpan? expiration)
        {
            return new Credential(
               CredentialTypes.ApiKey.V2,
               CreateKeyString(),
               expiration: expiration);
        }

        public Credential CreatePackageVerificationApiKey(Credential originalApiKey, string id)
        {
            var credential = new Credential(
               CredentialTypes.ApiKey.VerifyV1,
               CreateKeyString(),
               expiration: TimeSpan.FromDays(1));

            var ownerKeys = originalApiKey.Scopes
                .Where(s => s != null && s.HasOwnerScope())
                .Select(s => s.OwnerKey.Value)
                .Distinct().ToArray();

            if (!ownerKeys.Any())
            {
                // Legacy API key with no owner scope.
                credential.Scopes = new[] { new Scope(
                    ownerKey: null,
                    subject: id,
                    allowedAction: NuGetScopeActions.PackageVerify)
                };
            }
            else
            {
                credential.Scopes = ownerKeys
                    .Select(key => new Scope(
                        ownerKey: key,
                        subject: id,
                        allowedAction: NuGetScopeActions.PackageVerify))
                    .ToArray();
            }

            return credential;
        }

        public Credential CreateExternalCredential(string issuer, string value, string identity)
        {
            return new Credential(CredentialTypes.ExternalPrefix + issuer, value)
            {
                Identity = identity
            };
        }

        private static string CreateKeyString()
        {
            return Guid.NewGuid().ToString().ToLowerInvariant();
        }
    }
}