using System.ComponentModel.DataAnnotations;

namespace CinemaMVC.Web.Models.Entities
{
    /// <summary>
    /// Represents a Movie in the system.
    /// </summary>
    public class Movie
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Le titre du film est obligatoire.")]
        [StringLength(150, ErrorMessage = "Le titre ne doit pas dépasser 150 caractères.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "La description est obligatoire.")]
        [StringLength(1000, ErrorMessage = "La description ne doit pas dépasser 1000 caractères.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "La durée est obligatoire.")]
        [Range(1, 600, ErrorMessage = "La durée doit être comprise entre 1 et 600 minutes.")]
        public int DurationMinutes { get; set; }

        [Required(ErrorMessage = "Le genre est obligatoire.")]
        [StringLength(50, ErrorMessage = "Le genre ne doit pas dépasser 50 caractères.")]
        public string Genre { get; set; } = string.Empty;

        [Required(ErrorMessage = "La date de sortie est obligatoire.")]
        [DataType(DataType.Date)]
        public DateTime ReleaseDate { get; set; }

        public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
    }
}
