namespace Dotnet8UsersCrud.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Rut { get; set; }
        public string? Email { get; set; }
        public DateTime Birthday { get; set; }
    }
}
