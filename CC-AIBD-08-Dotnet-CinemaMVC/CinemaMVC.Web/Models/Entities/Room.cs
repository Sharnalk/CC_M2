using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaMVC.Web.Models.Entities
{
    /// <summary>
    /// Represents a room (hall/salle) within a Cinema.
    /// </summary>
    public class Room
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Le nom de la salle est obligatoire.")]
        [StringLength(50, ErrorMessage = "Le nom de la salle ne doit pas dépasser 50 caractères.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "La capacité est obligatoire.")]
        [Range(1, 1000, ErrorMessage = "La capacité doit être comprise entre 1 et 1000 places.")]
        public int Capacity { get; set; }

        [Required(ErrorMessage = "Le cinéma est obligatoire.")]
        public int CinemaId { get; set; }

        [ForeignKey("CinemaId")]
        public virtual Cinema? Cinema { get; set; }

        public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
    }
}
