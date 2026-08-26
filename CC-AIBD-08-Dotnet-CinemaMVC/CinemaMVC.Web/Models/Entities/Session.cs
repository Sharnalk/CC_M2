using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaMVC.Web.Models.Entities
{
    /// <summary>
    /// Represents a scheduled movie showing session.
    /// </summary>
    public class Session
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "La salle de cinéma est obligatoire.")]
        public int RoomId { get; set; }

        [ForeignKey("RoomId")]
        public virtual Room? Room { get; set; }

        [Required(ErrorMessage = "Le film est obligatoire.")]
        public int MovieId { get; set; }

        [ForeignKey("MovieId")]
        public virtual Movie? Movie { get; set; }

        [Required(ErrorMessage = "L'heure de la séance est obligatoire.")]
        [DataType(DataType.DateTime)]
        public DateTime ShowTime { get; set; }

        [Required(ErrorMessage = "Le prix de la séance est obligatoire.")]
        [Range(0.01, 100.00, ErrorMessage = "Le prix doit être compris entre 0.01€ et 100.00€.")]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }
    }
}
