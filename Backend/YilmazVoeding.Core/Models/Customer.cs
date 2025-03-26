namespace YilmazVoeding.Core.Models
{
    public class Customer
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; } // In productie: hash + salt
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string PostalCode { get; set; }
        public string City { get; set; }
        public DateTime CreatedAt { get; set; }
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
