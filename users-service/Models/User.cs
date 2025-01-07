namespace UsersService.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Rut { get; set; } = null!;
        public string? Email { get; set; }
        public DateTime Birthday { get; set; }
    }
}
