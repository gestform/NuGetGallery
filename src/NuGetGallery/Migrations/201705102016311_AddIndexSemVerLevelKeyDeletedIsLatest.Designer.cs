// <auto-generated />
namespace NuGetGallery.Migrations
{
    using System.CodeDom.Compiler;
    using System.Data.Entity.Migrations;
    using System.Data.Entity.Migrations.Infrastructure;
    using System.Resources;
    
    [GeneratedCode("EntityFramework.Migrations", "6.1.3-40302")]
    public sealed partial class AddIndexSemVerLevelKeyDeletedIsLatest : IMigrationMetadata
    {
        private readonly ResourceManager Resources = new ResourceManager(typeof(AddIndexSemVerLevelKeyDeletedIsLatest));
        
        string IMigrationMetadata.Id
        {
            get { return "201705102016311_AddIndexSemVerLevelKeyDeletedIsLatest"; }
        }
        
        string IMigrationMetadata.Source
        {
            get { return null; }
        }
        
        string IMigrationMetadata.Target
        {
            get { return Resources.GetString("Target"); }
        }
    }
}